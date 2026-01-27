import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
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

export type Session = Database['public']['Tables']['Sessions']['Row'] & {
	encounters: { count: number }[];
};

export async function fetchAllSessions(): Promise<Session[] | null> {
	const { data, error } = await supabase
		.from('Sessions')
		.select('id, visit_date, encounters:Encounters(count)')
		.order('visit_date', { ascending: false });

	if (error || !data) {
		return null;
	}
	return data;
}
