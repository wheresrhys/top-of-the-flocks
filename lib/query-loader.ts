import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load a GraphQL query from the queries directory
 * @param filename - The filename without extension (e.g., 'species' for 'species.graphql')
 * @returns The GraphQL query string
 */
export function loadQuery(filename: string): string {
  try {
    const queryPath = join(process.cwd(), 'queries', `${filename}.graphql`);
    return readFileSync(queryPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load GraphQL query from ${filename}.graphql: ${error}`);
  }
}

/**
 * Load multiple GraphQL queries at once
 * @param filenames - Array of filenames without extension
 * @returns Object with filename as key and query string as value
 */
export function loadQueries(filenames: string[]): Record<string, string> {
  const queries: Record<string, string> = {};

  for (const filename of filenames) {
    queries[filename] = loadQuery(filename);
  }

  return queries;
}
