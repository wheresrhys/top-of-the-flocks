'use client';

import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { supabase } from '@/lib/supabase';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { graphqlRequest } from '@/lib/graphql-client';

interface Example {
  id: number;
  name: string;
}

export default function ExampleComponent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supabaseData, setSupabaseData] = useState<Example[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasuraData, setHasuraData] = useState<Example[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Example: Fetch from Supabase
        // Uncomment and modify based on your actual table structure
        /*
        const { data: supabaseResult, error: supabaseError } = await supabase
          .from('your_table_name')
          .select('*')
          .limit(10);

        if (supabaseError) {
          throw supabaseError;
        }
        setSupabaseData(supabaseResult);
        */

        // Example: Fetch from Hasura via GraphQL
        // Uncomment and modify based on your actual schema
        /*
        const hasuraResult = await graphqlRequest<{ your_table: Example[] }>(`
          query {
            your_table(limit: 10) {
              id
              name
            }
          }
        `);

        if (hasuraResult.errors) {
          throw new Error(hasuraResult.errors[0].message);
        }
        setHasuraData(hasuraResult.data?.your_table || null);
        */

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Example Data Display</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Supabase Data</h3>
        {supabaseData ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(supabaseData, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-600">No Supabase data to display (configure your query above)</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Hasura GraphQL Data</h3>
        {hasuraData ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(hasuraData, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-600">No Hasura data to display (configure your query above)</p>
        )}
      </div>
    </div>
  );
}
