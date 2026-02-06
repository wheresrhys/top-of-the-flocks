import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
export type SpeciesStatsRow =
	Database['public']['Views']['SpeciesStats']['Row'];

export async function fetchSpeciesData(): Promise<SpeciesStatsRow[]> {
	return supabase
		.from('SpeciesStats')
		.select('*')
		.order('encounter_count', { ascending: false })
		.then(catchSupabaseErrors) as Promise<SpeciesStatsRow[]>;
}
