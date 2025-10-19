import { hasuraConfig, hasuraHeaders } from './hasura';

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * Execute a GraphQL query against Hasura
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Promise with the response data
 */
export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  try {
    const response = await fetch(hasuraConfig.endpoint, {
      method: 'POST',
      headers: hasuraHeaders,
      body: JSON.stringify({
        query,
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
