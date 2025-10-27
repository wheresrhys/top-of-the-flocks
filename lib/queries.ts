import { loadQuery } from './query-loader';
import type { 
  HomePageQuery, 
  HomePageQueryVariables,
  SpeciesPageQuery,
  SpeciesPageQueryVariables
} from '../types/graphql.types';

// Type-safe query definitions
export const queries = {
  home: {
    query: loadQuery('home'),
    // Type helpers for this specific query
    type: {} as HomePageQuery,
    variables: {} as HomePageQueryVariables,
  },
  species: {
    query: loadQuery('species'),
    // Type helpers for this specific query  
    type: {} as SpeciesPageQuery,
    variables: {} as SpeciesPageQueryVariables,
  },
} as const;

// Export individual queries for convenience
export const GET_HOME_PAGE = queries.home.query;
export const GET_SPECIES_PAGE = queries.species.query;

// Type helpers
export type HomeQuery = typeof queries.home.type;
export type HomeQueryVariables = typeof queries.home.variables;
export type SpeciesQuery = typeof queries.species.type;
export type SpeciesQueryVariables = typeof queries.species.variables;
