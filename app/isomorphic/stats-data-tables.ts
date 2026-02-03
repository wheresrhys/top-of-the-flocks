import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';

export type TopPeriodsResult =
	Database['public']['Functions']['top_periods_by_metric']['Returns'][number];
export type TopSpeciesResult =
	Database['public']['Functions']['top_species_by_metric']['Returns'][number];
export type TopStatsResult = TopPeriodsResult | TopSpeciesResult;

type TopPeriodsArgs =
	Database['public']['Functions']['top_periods_by_metric']['Args'];
type TopSpeciesArgs =
	Database['public']['Functions']['top_species_by_metric']['Args'];
export type TopStatsArguments = TopPeriodsArgs | TopSpeciesArgs;
export type TopStatsArgsWithoutLimit = Omit<TopStatsArguments, 'result_limit'>;

export async function getTopPeriodsByMetric(
	options: TopPeriodsArgs
): Promise<TopPeriodsResult[] | null> {
	return supabase
		.rpc('top_periods_by_metric', options)
		.then(catchSupabaseErrors);
}

export async function getTopSpeciesByMetric(
	options: TopSpeciesArgs
): Promise<TopSpeciesResult[] | null> {
	return supabase
		.rpc('top_species_by_metric', options)
		.then(catchSupabaseErrors);
}

export async function getTopStats(
	isBySpecies: boolean,
	dataArguments: TopStatsArguments
): Promise<TopPeriodsResult[] | TopSpeciesResult[] | null> {
	const data = isBySpecies
		? await getTopSpeciesByMetric({
				...dataArguments
			} as TopSpeciesArgs)
		: await getTopPeriodsByMetric({
				...dataArguments
			} as TopPeriodsArgs);
	return data;
}
