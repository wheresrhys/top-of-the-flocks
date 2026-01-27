import type { PanelDefinition } from '../components/StatsAccordion';
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

export async function fetchPanelData(
	panel: PanelDefinition,
	limit: number
): Promise<TopPeriodsResult[] | null> {
	const data = await getTopPeriodsByMetric({
		...panel.dataArguments,
		result_limit: limit
	});
	return data;
}
