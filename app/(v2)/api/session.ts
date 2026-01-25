import { supabase } from '@/lib/supabase';

type EncounterWithRelations = {
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
			`
			age,
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
			Birds (
				ring_no,
				Species (
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
	return data.map(encounter => {
    const bird = encounter.Birds[0];
    const { Birds, ...flattenedEncounter } = encounter;

    return {...flattenedEncounter, ring_no: bird.ring_no, species_name: bird.Species[0].species_name};
  }) as EncounterWithRelations[];
}
