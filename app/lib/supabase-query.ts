import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import type { PostgrestError } from '@supabase/supabase-js';

type FilterOperator = 'eq' | 'like' | 'ilike' | 'is' | 'in';

type QueryInput = {
  query: string;
  rootTable: keyof Database['public']['Tables'];
  identityField: string;
  identityValue: string | number;
  identityOperator: FilterOperator;
}

function buildSelect ({
  query,
  rootTable,
  identityField,
  identityValue,
  identityOperator
}: QueryInput) {
  const selectBuilder = supabase
    .from(rootTable)
    .select(query)

  switch (identityOperator) {
    case 'eq':
      return selectBuilder.eq(identityField, identityValue as number);
    case 'like':
      return selectBuilder.like(identityField, identityValue as string);
    case 'ilike':
      return selectBuilder.ilike(identityField, identityValue as string);
    // case 'is':
    //   return selectBuilder.is(identityField, identityValue);
    // case 'in':
    //   return selectBuilder.in(identityField, identityValue.split(','));
    default:
      throw new Error(`Unsupported filter operator: ${identityOperator}`);
  }
}

export async function querySupabaseForRecord<ReturnType>(queryInput: QueryInput): Promise<ReturnType | null> {

  // Then get encounters with nested bird and species data
  const { data, error } = await buildSelect(queryInput).maybeSingle()
  if (error) {
    throw new Error(`Failed to fetch ${queryInput.rootTable} data for ${queryInput.identityField}: ${queryInput.identityValue}: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  // Return empty array if no encounters found, otherwise return the data
  return data as ReturnType;
}

export async function querySupabaseForList<ReturnType>(queryInput: QueryInput): Promise<ReturnType[]> {

  // Then get encounters with nested bird and species data
  const { data, error } = await buildSelect(queryInput)
  if (error) {
    throw new Error(`Failed to fetch ${queryInput.rootTable} data for ${queryInput.identityField}: ${queryInput.identityValue}: ${error.message}`);
  }
  if (!data) {
    return [] as ReturnType[];
  }
  // Return empty array if no encounters found, otherwise return the data
  return data as ReturnType[];
}

export async function querySupabaseForNestedList<ReturnType>(queryInput: QueryInput & { listProperty: string }): Promise<ReturnType[] | null> {

  // Then get encounters with nested bird and species data
  const { data, error } = await buildSelect(queryInput).maybeSingle()
  if (error) {
    throw new Error(`Failed to fetch ${queryInput.rootTable} data for ${queryInput.identityField}: ${queryInput.identityValue}: ${error.message}`);
  }
  if (!data) {
    return null
  }

  const result = (data as unknown as Record<string, ReturnType[] | undefined>)[queryInput.listProperty];
  if (!Array.isArray(result)) {
    return null;
  }
  return result as ReturnType[];

}
