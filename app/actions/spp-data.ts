'use server';
import { fetchAccessibleAggregateStats } from '@/lib/group-summary-access';
import type { AggregateStatsResult } from '@/app/models/db';

export async function fetchSpeciesData(
	viewedGroupId: number,
	fromDate?: string,
	toDate?: string
): Promise<AggregateStatsResult[]> {
	return fetchAccessibleAggregateStats(viewedGroupId, {
		from_date: fromDate,
		to_date: toDate,
		group_by_species: true
	});
}
