'use client';

/**
 * Example Component showing how to use Supabase and Hasura
 * 
 * This is a template/example file. To use it:
 * 1. Copy this file to create your own component
 * 2. Uncomment the imports and code sections you need
 * 3. Modify the queries to match your database schema
 */

import { useState, useEffect } from 'react';

export default function ExampleComponent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Example: Fetch from Supabase
        // Uncomment the following to use:
        /*
        import { supabase } from '@/lib/supabase';
        
        const { data: supabaseResult, error: supabaseError } = await supabase
          .from('your_table_name')
          .select('*')
          .limit(10);

        if (supabaseError) {
          throw supabaseError;
        }
        console.log('Supabase data:', supabaseResult);
        */

        // Example: Fetch from Hasura via GraphQL
        // Uncomment the following to use:
        /*
        import { graphqlRequest } from '@/lib/graphql-client';
        
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
        console.log('Hasura data:', hasuraResult.data?.your_table);
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
      <h2 className="text-xl font-bold mb-4">Example Component</h2>
      <p className="mb-4 text-gray-700">
        This is an example component showing how to integrate Supabase and Hasura.
        See the source code for usage examples.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold mb-2">To use this component:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Copy this file to create your own component</li>
          <li>Uncomment the imports and code sections you need</li>
          <li>Modify the queries to match your database schema</li>
          <li>Remove this instructional UI</li>
        </ol>
      </div>
    </div>
  );
}
