import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedSupabaseClient } from './group-auth';
import { getGroupCookie } from '../app/actions/group-cookie';
import { supabase, catchSupabaseErrors } from './supabase';
import { resolveGroupPublicAreasForRequest } from './group-slug';
import type { AggregateStatsResult } from '@/app/models/db';

// Shared param shape for both `aggregate_stats` and `public_aggregate_stats`
// (the two functions share an identical Args signature — see #772/#768).
// `ringing_group_filter` is supplied separately by the resolver below, since
// every caller of this module always scopes to one `viewedGroupId`.
export type AggregateStatsRpcParams = {
	species_name_filter?: string;
	from_date?: string;
	to_date?: string;
	group_by_species?: boolean;
	group_by_time_period?: string;
};

export type GroupSummaryAccessLevel = 'own' | 'shared' | 'public' | 'blocked';

export type AuthorisedSummaryResult = {
	accessLevel: GroupSummaryAccessLevel;
	rows: AggregateStatsResult[];
};

async function runAggregateStats(
	rpcName: 'aggregate_stats' | 'public_aggregate_stats',
	client: SupabaseClient,
	viewedGroupId: number,
	rpcParams: AggregateStatsRpcParams
): Promise<AggregateStatsResult[]> {
	const rows = (await client
		.rpc(rpcName, { ringing_group_filter: viewedGroupId, ...rpcParams })
		.then(catchSupabaseErrors)) as AggregateStatsResult[] | null;
	return rows ?? [];
}

// `aggregate_stats` always emits at least one row for an ungrouped query
// (its spine is a 1x1 cross join, independent of RLS-visible data), so an
// RLS-blocked cross-group call never comes back as a literally-empty array —
// it comes back as a single row of COALESCEd zeros. This checks for that
// case too, so "blocked by RLS" and "no rows at all" (the grouped-query
// case) are both treated as "nothing visible here".
function hasVisibleData(rows: AggregateStatsResult[]): boolean {
	return rows.length > 0 && rows.some((row) => row.encounter_count > 0);
}

/**
 * Resolves the correct read path for a group's aggregate summary stats, and
 * which of it actually reached the caller — see #770 for the full model.
 * `viewedGroupId` is the group whose data is being requested; the viewer is
 * derived internally from the session cookie (or its absence), never passed
 * in — this is deliberately not a cookie-presence check:
 *
 * 1. viewer's own group === target -> the viewer's existing authenticated
 *    client, unchanged, even if the result is genuinely empty (a group must
 *    always be able to see its own — possibly empty — summary).
 * 2. otherwise, attempt the viewer's existing authenticated client (covers
 *    an existing `GroupDataSharing` grant, RLS-enforced as before).
 * 3. if (2) threw (no session cookie) or came back with nothing visible,
 *    and the target has opted its summary into public view
 *    (`public_areas` contains `'summary'`) -> retry via the SECURITY
 *    DEFINER `public_aggregate_stats` RPC, which needs no JWT.
 * 4. none of the above -> blocked. No rows, no throw.
 *
 * Returns the access decision alongside the rows (not just the rows) so a
 * caller that cares which path served the data can destructure `accessLevel`
 * — every existing action function currently only destructures `rows`.
 */
export async function fetchAuthorisedAggregateStats(
	viewedGroupId: number,
	rpcParams: AggregateStatsRpcParams = {}
): Promise<AuthorisedSummaryResult> {
	const viewerGroupId = await getGroupCookie();

	if (viewerGroupId === viewedGroupId) {
		const client = await getAuthenticatedSupabaseClient();
		const rows = await runAggregateStats(
			'aggregate_stats',
			client,
			viewedGroupId,
			rpcParams
		);
		return { accessLevel: 'own', rows };
	}

	let sharedRows: AggregateStatsResult[] | null = null;
	try {
		const client = await getAuthenticatedSupabaseClient();
		sharedRows = await runAggregateStats(
			'aggregate_stats',
			client,
			viewedGroupId,
			rpcParams
		);
	} catch {
		// No session cookie (anonymous viewer) — fall through to the public
		// check below.
		sharedRows = null;
	}

	if (sharedRows && hasVisibleData(sharedRows)) {
		return { accessLevel: 'shared', rows: sharedRows };
	}

	const publicAreas = await resolveGroupPublicAreasForRequest(viewedGroupId);
	if (publicAreas.includes('summary')) {
		const rows = await runAggregateStats(
			'public_aggregate_stats',
			supabase,
			viewedGroupId,
			rpcParams
		);
		return { accessLevel: 'public', rows };
	}

	return { accessLevel: 'blocked', rows: [] };
}
