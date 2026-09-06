'use server';
import { fetchAuthorisedAggregateStats } from '@/lib/group-summary-access';
import type { AggregateStatsResult } from '@/app/models/db';

export async function fetchSpeciesData(
	viewedGroupId: number,
	fromDate?: string,
	toDate?: string
): Promise<AggregateStatsResult[]> {
	const { rows } = await fetchAuthorisedAggregateStats(viewedGroupId, {
		from_date: fromDate,
		to_date: toDate,
		group_by_species: true
	});
	return rows;
}
