import type { PanelDefinition } from '../components/StatsAccordion';
import type { StatsAccordionModel } from '../components/StatsAccordion';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';

export type StatsAccordionArguments =
	Database['public']['Functions']['top_periods_by_metric']['Args'];
export type TopPeriodsResult =
	Database['public']['Functions']['top_periods_by_metric']['Returns'][number];

async function getTopPeriodsByMetric(
	options: StatsAccordionArguments
): Promise<TopPeriodsResult[] | null> {
	const { data, error } = await supabase.rpc('top_periods_by_metric', options);
	return data;
}

export async function fetchInitialData(
	panels: PanelDefinition[]
): Promise<StatsAccordionModel[]> {
	const topPeriodsByMetric = await Promise.all(
		panels.map(async (panel) => {
			const data = await getTopPeriodsByMetric({
				...panel.dataArguments,
				result_limit: 1
			});
			return {
				definition: panel,
				data: data ?? []
			};
		})
	);
	return topPeriodsByMetric;
}

export async function fetchDrillDownData(
	panel: PanelDefinition
): Promise<TopPeriodsResult[] | null> {
	const data = await getTopPeriodsByMetric({
		...panel.dataArguments,
		result_limit: 5
	});
	return data;
}
