import { gql } from 'graphql-tag';
import type {
  AllSpeciesStatsQuery,
  AllSpeciesStatsQueryVariables,
  SpeciesPageQuery,
  SpeciesPageQueryVariables,
  Top5TableQuery,
  Top5TableQueryVariables,
} from '../types/graphql.types';

const ALL_SPECIES_STATS_QUERY = gql`
  query AllSpeciesStats {
    speciesLeagueTable {
      speciesName
      individuals
      encounters
      sessionCount
      longestStay
      unluckiest
      longestWinged
      averageWingLength
      shortestWinged
      heaviest
      averageWeight
      lightest
      totalWeight
    }
  }
`;

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
  AllSpeciesStatsQuery,
  AllSpeciesStatsQueryVariables,
  SpeciesPageQuery,
  SpeciesPageQueryVariables,
  TopSessionsResult,
  Top5TableQuery,
  Top5TableQueryVariables,
  QueryTopSessionsByMetricArgs
} from '../types/graphql.types';

// Export DocumentNode objects directly
export { ALL_SPECIES_STATS_QUERY, TOP5_TABLE_QUERY, SPECIES_QUERY };

// Type-safe query definitions
export const queries = {
  allSpeciesStats: {
    query: ALL_SPECIES_STATS_QUERY,
    // Type helpers for this specific query
    type: {} as AllSpeciesStatsQuery,
    variables: {} as AllSpeciesStatsQueryVariables,
  },
  species: {
    query: SPECIES_QUERY,
    // Type helpers for this specific query
    type: {} as SpeciesPageQuery,
    variables: {} as SpeciesPageQueryVariables,
  },
} as const;

// Export individual queries for convenience
export const GET_ALL_SPECIES_STATS = queries.allSpeciesStats.query;
export const GET_SPECIES_PAGE = queries.species.query;

