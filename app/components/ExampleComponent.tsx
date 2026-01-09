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
import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemText
} from '@mui/material';

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
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error">Error: {error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 4 }}>
			<Typography variant="h4" component="h2" gutterBottom>
				Example Component
			</Typography>
			<Typography variant="body1" color="text.secondary" paragraph>
				This is an example component showing how to integrate Supabase and
				Hasura. See the source code for usage examples.
			</Typography>

			<Card
				sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}
			>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						To use this component:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary="1. Copy this file to create your own component" />
						</ListItem>
						<ListItem>
							<ListItemText primary="2. Uncomment the imports and code sections you need" />
						</ListItem>
						<ListItem>
							<ListItemText primary="3. Modify the queries to match your database schema" />
						</ListItem>
						<ListItem>
							<ListItemText primary="4. Remove this instructional UI" />
						</ListItem>
					</List>
				</CardContent>
			</Card>
		</Box>
	);
}
