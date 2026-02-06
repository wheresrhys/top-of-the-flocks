import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
export type SpeciesStatsRow =
	Database['public']['Functions']['species_stats']['Returns'][number];

export async function fetchSpeciesData(
	fromDate?: string,
	toDate?: string
): Promise<SpeciesStatsRow[]> {
	return supabase
		.rpc('species_stats', {
			from_date: fromDate,
			to_date: toDate
		})
		.then(catchSupabaseErrors) as Promise<SpeciesStatsRow[]>;
}
