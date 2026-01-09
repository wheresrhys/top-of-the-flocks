import { loadQuery } from './query-loader';
import type {
  AllSpeciesStatsQuery,
  AllSpeciesStatsQueryVariables,
  SpeciesPageQuery,
  SpeciesPageQueryVariables
} from '../types/graphql.types';

// Type-safe query definitions
export const queries = {
  allSpeciesStats: {
    query: loadQuery('all-species-stats'),
    // Type helpers for this specific query
    type: {} as AllSpeciesStatsQuery,
    variables: {} as AllSpeciesStatsQueryVariables,
  },
  species: {
    query: loadQuery('species'),
    // Type helpers for this specific query
    type: {} as SpeciesPageQuery,
    variables: {} as SpeciesPageQueryVariables,
  },
} as const;

// Export individual queries for convenience
export const GET_ALL_SPECIES_STATS = queries.allSpeciesStats.query;
export const GET_SPECIES_PAGE = queries.species.query;

// Type helpers
export type { AllSpeciesStatsQuery, AllSpeciesStatsQueryVariables };
export type SpeciesQuery = typeof queries.species.type;
export type SpeciesQueryVariables = typeof queries.species.variables;
