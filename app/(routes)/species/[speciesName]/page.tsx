import {
	BootstrapPage,
	defaultGetParams
} from '@/app/components/layout/BootstrapPage';
import { getAuthenticatedSupabaseClient } from '@/lib/group-auth';
import { catchSupabaseErrors } from '@/lib/supabase';
import { fetchPageOfBirds } from '@/app/actions/sp-data';
import { readTabIdSearchParam } from '@/lib/tab-query-param';
import {
	SpeciesPageContent,
	type PageParams,
	type PeriodScope,
	type PageData
} from './PageContent';

import type { AggregateStatsResult } from '@/app/models/db';
import type { ViewedGroup } from '@/lib/group-slug';

type PageProps = {
	params: Promise<{ speciesName: string }>;
	searchParams?: Promise<{ tabId?: string }>;
};

// Merges the route's `speciesName` with the optional `?tabId=` search param
// (#803) into the shared `PageParams` shape, so the requested tab is known
// before first paint (see PageContent.tsx's `SpeciesData` for how it's
// resolved against the page's known tab ids and seeded as the initial tab).
async function getSpeciesPageParams(pageProps: PageProps): Promise<PageParams> {
	const { speciesName } = await defaultGetParams<
		PageProps,
		{ speciesName: string }
	>(pageProps);
	const tabId = await readTabIdSearchParam(pageProps.searchParams);
	return { speciesName, ...(tabId ? { tabId } : {}) };
}

async function getSpeciesStats(
	species: string,
	viewedGroupId: number,
	fromDate?: string,
	toDate?: string
) {
	const supabase = await getAuthenticatedSupabaseClient();
	return supabase
		.rpc('aggregate_stats', {
			species_name_filter: species,
			ringing_group_filter: viewedGroupId,
			...(fromDate ? { from_date: fromDate } : {}),
			...(toDate ? { to_date: toDate } : {})
		})
		.then(catchSupabaseErrors) as Promise<AggregateStatsResult[]>;
}

// Shared core fetcher for all three species route levels. Given a resolved
// `PeriodScope` it threads the date range into the encounter-level fetchers
// (birds + aggregate stats), and echoes the period back on the returned data
// so the client can build the heading and scope its own tab fetches
// (including the Highlights tab's Busiest sessions section, which fetches
// lazily by year/month rather than eagerly here). The unscoped route passes
// an empty period, reproducing today's all-time behaviour exactly.
export async function fetchSpeciesPageContentForPeriod(
	params: PageParams,
	viewedGroupId: number,
	period: PeriodScope = {}
): Promise<PageData | null> {
	const { year, month, fromDate, toDate } = period;
	const supabase = await getAuthenticatedSupabaseClient();
	const { id: speciesId } = (await supabase
		.from('Species')
		.select('id')
		.eq('species_name', params.speciesName)
		.single()
		.then(catchSupabaseErrors)) as { id: number };
	if (!speciesId) {
		throw new Error(`Species ${params.speciesName} not found`);
	}
	const [birds, speciesStats] = await Promise.all([
		fetchPageOfBirds(speciesId, viewedGroupId, 0, fromDate, toDate),
		getSpeciesStats(params.speciesName, viewedGroupId, fromDate, toDate)
	]);
	if (birds.length === 0) {
		return {
			speciesId,
			year,
			month,
			fromDate,
			toDate
		};
	}
	return {
		birds,
		speciesStats: speciesStats[0],
		speciesId,
		speciesName: params.speciesName,
		year,
		month,
		fromDate,
		toDate
	};
}

export async function fetchSpeciesPageContent(
	params: PageParams,
	viewedGroupId: number
): Promise<PageData | null> {
	return fetchSpeciesPageContentForPeriod(params, viewedGroupId);
}

export default async function SpeciesPage(
	props: PageProps & { viewedGroup?: ViewedGroup }
) {
	return (
		<BootstrapPage<PageData, PageProps, PageParams>
			pageProps={props}
			viewedGroup={props.viewedGroup}
			getParams={getSpeciesPageParams}
			getCacheKeys={(params: PageParams) => ['species', params.speciesName]}
			dataFetcher={fetchSpeciesPageContent}
			PageComponent={SpeciesPageContent}
		/>
	);
}
