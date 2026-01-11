import { gql } from 'graphql-tag';
import type {
  SpeciesPageQuery,
  SpeciesPageQueryVariables,
} from '../types/graphql.types';


const SPECIES_QUERY = gql`
  query SpeciesPage($speciesName: String1) {
    species(where: { speciesName: { _eq: $speciesName } }) {
      speciesName
      birdsAggregate {
        _count
      }
      birds {
        encounters {
          visitDate
        }
        encountersAggregate {
          _count
        }
      }
    }
  }
`;

export type {
  SpeciesPageQuery,
  SpeciesPageQueryVariables,
} from '../types/graphql.types';

// Export DocumentNode objects directly
export { SPECIES_QUERY };

// Type-safe query definitions
export const queries = {
  species: {
    query: SPECIES_QUERY,
    // Type helpers for this specific query
    type: {} as SpeciesPageQuery,
    variables: {} as SpeciesPageQueryVariables,
  },
} as const;

// Export individual queries for convenience
export const GET_SPECIES_PAGE = queries.species.query;

