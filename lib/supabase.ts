import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function catchSupabaseErrors<T>(query: SupabaseSingleQuery<T>): Promise<T | null> {
	const { data, error } = await query;
	if (error) {
		throw new Error(`Failed to fetch data: ${error.message}`);
	}
	return data;
}
