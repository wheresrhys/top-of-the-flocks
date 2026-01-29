import type { PanelDefinition } from '../components/StatsAccordion';
import { catchSupabaseErrors, supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';

export type StatsAccordionArguments =
	Database['public']['Functions']['top_periods_by_metric']['Args'];
export type TopPeriodsResult =
	Database['public']['Functions']['top_periods_by_metric']['Returns'][number];
export type TopSpeciesResult =
	Database['public']['Functions']['top_species_by_metric']['Returns'][number];

export async function getTopPeriodsByMetric(
	options: StatsAccordionArguments
): Promise<TopPeriodsResult[] | null> {
	return supabase
		.rpc('top_periods_by_metric', options)
		.then(catchSupabaseErrors);
}

export async function getTopSpeciesByMetric(
	options: StatsAccordionArguments
): Promise<TopSpeciesResult[] | null> {
	return supabase
		.rpc('top_species_by_metric', options)
		.then(catchSupabaseErrors);
}

export async function fetchPanelData(
	panel: PanelDefinition,
	limit: number
): Promise<TopPeriodsResult[] | TopSpeciesResult[] | null> {
	const data = panel.bySpecies
		? await getTopSpeciesByMetric({
				...panel.dataArguments,
				result_limit: limit
			})
		: await getTopPeriodsByMetric({
				...panel.dataArguments,
				result_limit: limit
			});
	return data;
}
