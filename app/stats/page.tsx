import { Suspense } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { graphqlRequest } from '../../lib/graphql-client';
import { GET_ALL_SPECIES_STATS, type AllSpeciesStatsQuery } from '../../lib/queries';
import { SortableSpeciesTable } from '../components/SortableSpeciesTable';

async function getSpeciesData(): Promise<AllSpeciesStatsQuery> {
	const response = await graphqlRequest<AllSpeciesStatsQuery>(GET_ALL_SPECIES_STATS);

	if (response.errors) {
		throw new Error(
			`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`
		);
	}

	if (!response.data) {
		throw new Error('No data returned from GraphQL query');
	}

	return response.data;
}

async function SpeciesTableWrapper() {
	const data = await getSpeciesData();
	return <SortableSpeciesTable data={data.speciesLeagueTable || []} />;
}

export default function SpeciesStats() {
	return (
		<Container maxWidth="xl">
			<Box
				sx={{
					minHeight: '100vh',
					py: 4
				}}
			>

				<Suspense
					fallback={
						<Box display="flex" justifyContent="center" py={4}>
							<CircularProgress />
						</Box>
					}
				>
					<SpeciesTableWrapper />
				</Suspense>
			</Box>
		</Container>
	);
}
