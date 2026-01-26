import { supabase } from '@/lib/supabase';

export type EncounterWithRelations = {
	age: number;
	capture_time: string;
	is_juv: boolean;
	record_type: string;
	sex: string;
	weight: number | null;
	wing_length: number | null;
	breeding_condition: string | null;
	extra_text: string | null;
	moult_code: string | null;
	old_greater_coverts: number | null;
	scheme: string;
	sexing_method: string | null;
	ring_no: string;
	species_name: string;
};

function flattenEncounter(encounter: Database['public']['Tables']['Encounters']['Row']): EncounterWithRelations {
		const { bird, ...flattenedEncounter } = encounter;
		// This is a workaround to type the bird object correctly
		// supabase does not return arrays for many to one relationships
		// even though the type definitions suggest it does
		const correctlyTypedBird = bird as unknown as {
			ring_no: string;
			species: { species_name: string };
		};
		return {
			...flattenedEncounter,
			ring_no: correctlyTypedBird.ring_no,
			species_name: correctlyTypedBird.species.species_name
		};
	}

export async function fetchSessionDataByDate(
	date: string
): Promise<EncounterWithRelations[] | null> {
	// First get session_id from visit_date

	const { data: session, error: sessionError } = await supabase
		.from('Sessions')
		.select('id')
		.eq('visit_date', date)
		.single();
	if (sessionError || !session) {
		return null;
	}
	// Then get encounters with nested bird and species data
	const { data, error } = await supabase
		.from('Encounters')
		.select(
			`id,
      session_id,
			age,
      bird_id,
			capture_time,
			is_juv,
			record_type,
			sex,
			weight,
			wing_length,
			breeding_condition,
			extra_text,
			moult_code,
			old_greater_coverts,
			scheme,
			sexing_method,
			bird:Birds (
        id,
        species_id,
				ring_no,
				species:Species (
          id,
					species_name
				)
			)
		`
		)
		.eq('session_id', session.id);
	if (error) {
		throw new Error(`Failed to fetch session data: ${error.message}`);
	}
	if (!data) {
		return [] as EncounterWithRelations[];
	}
	// Return empty array if no encounters found, otherwise return the data
	return data.map(flattenEncounter) as EncounterWithRelations[];
}

export async function fetchSessionDataForSpeciesByDate(
	date: string,
	species: string
): Promise<EncounterWithRelations[] | null> {
	const { data, error } = await supabase
		.from('Encounters')
		.select(`id,
      session_id,
			age,
      bird_id,
			capture_time,
			is_juv,
			record_type,
			sex,
			weight,
			wing_length,
			breeding_condition,
			extra_text,
			moult_code,
			old_greater_coverts,
			scheme,
			sexing_method,
			bird:Birds (
        id,
        species_id,
				ring_no,
				species:Species (
          id,
					species_name
				)
			)
		`)
		.eq('session_id', session.id)
		.eq('species_name', species);
	if (error) {
		throw new Error(`Failed to fetch session data: ${error.message}`);
	}
	return data.map(flattenEncounter) as EncounterWithRelations[];
}
