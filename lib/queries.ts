import { loadQuery } from './query-loader';
export type {
  AllSpeciesStatsQuery,
  AllSpeciesStatsQueryVariables,
  SpeciesPageQuery,
  SpeciesPageQueryVariables,
  TopSessionsResult,
  QueryTopSessionsByMetricArgs
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
  top5Table: {
    query: loadQuery('top5-table'),
    // Type helpers for this specific query
    type: {} as Top5TableQuery,
    variables: {} as Top5TableQueryVariables,
  },
} as const;

// Export individual queries for convenience
export const GET_ALL_SPECIES_STATS = queries.allSpeciesStats.query;
export const GET_SPECIES_PAGE = queries.species.query;
export const TOP5_SESSIONS = queries.top5Table.query;
export const TOP5_MONTHS = queries.top5Table.query;
export const TOP5_YEARS = queries.top5Table.query;

