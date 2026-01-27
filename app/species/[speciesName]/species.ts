import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
export type BirdWithEncounters = {
	age: number;
	capture_time: string;
	encounters: EncounterWithRelations[]
};

type BirdWithEncounters = Database['public']['Tables']['Species']['Row'] & {
	birds: (Database['public']['Tables']['Birds']['Row'] & {
		encounters: (Database['public']['Tables']['Encounters']['Row'] & {
			session: Database['public']['Tables']['Sessions']['Row']
		})[]
	})[]
};


export async function fetchSpeciesData(
	speciesName: string
): Promise<EncounterWithRelations[] | null> {
	const { data, error } = await supabase
		.from('Species')
		.select(`
		id,
		species_name,
		birds:Birds (
			id,
			ring_no,
			species_id,
			encounters:Encounters (
				id,
				 session_id,
					age,
					capture_time,
					record_type,
					sex,
					weight,
					wing_length,
					session:Sessions(
					visit_date
					)
			)
		)
		`)
		.eq('species_name', speciesName)
	if (error) {
		throw new Error(`Failed to fetch session data: ${error.message}`);
	}
	if (!data) {
		return [] as BirdWithEncounters[];
	}
	// Return empty array if no encounters found, otherwise return the data
	return data[0].birds as unknown as BirdWithEncounters[];
}
