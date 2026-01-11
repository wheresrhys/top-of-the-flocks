import type { DocumentNode } from 'graphql';
import { hasuraConfig, hasuraHeaders } from './hasura';

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * Extract query string from graphql-tag DocumentNode
 */
function extractQueryString(query: DocumentNode): string {
  if (query.loc?.source?.body) {
    return query.loc.source.body;
  }
  throw new Error('Unable to extract query string from DocumentNode');
}

/**
 * Execute a GraphQL query against Hasura
 * @param query - GraphQL query DocumentNode
 * @param variables - Query variables
 * @returns Promise with the response data
 */
export async function graphqlRequest<T = unknown>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  if (!hasuraConfig.endpoint) {
    throw new Error('Hasura endpoint is not configured. Please set NEXT_PUBLIC_HASURA_ENDPOINT in your environment variables.');
  }

  const queryString = extractQueryString(query);

  try {
    const response = await fetch(hasuraConfig.endpoint, {
      method: 'POST',
      headers: hasuraHeaders,
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();
    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}
