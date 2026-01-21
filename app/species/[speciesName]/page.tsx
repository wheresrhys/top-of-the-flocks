import { Suspense } from 'react';
import { Container, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { graphqlRequest } from '../../../lib/graphql-client';
import { gql } from 'graphql-tag';
import type { SpeciesPageQuery } from '../../../types/graphql.types';

const SPECIES_DETAILS_QUERY = gql`
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

async function getSpeciesDetails(
	speciesName: string
): Promise<SpeciesPageQuery> {
	const response = await graphqlRequest<SpeciesPageQuery>(
		SPECIES_DETAILS_QUERY,
		{
			speciesName
		}
	);

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

interface PageProps {
	params: { speciesName: string };
}

async function SpeciesDetails({speciesName}: {speciesName: string}) {
	const data = await getSpeciesDetails(speciesName);
	if (!data.species || data.species.length === 0) {
		return (
			<Container maxWidth="lg">
				<Box sx={{ py: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Species &ldquo;{speciesName}&rdquo; not found
					</Typography>
				</Box>
			</Container>
		);
	}
	const species = data.species[0];

	// Calculate total encounters
	const totalEncounters =
		species.birds?.reduce(
			(sum: number, bird) => sum + (bird.encountersAggregate._count || 0),
			0
		) || 0;

	// Calculate unique session dates
	const uniqueDates = new Set(
		species.birds?.flatMap(
			(bird) => bird.encounters?.map((encounter) => encounter.visitDate) || []
		) || []
	);
	const sessionCount = uniqueDates.size;

	return (
		<Container maxWidth="lg">
			<Box sx={{ py: 4 }}>
				<Typography
					variant="h3"
					component="h1"
					gutterBottom
					sx={{ mb: 4, fontWeight: 'bold' }}
				>
					{species.speciesName}
				</Typography>

				<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
					<Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
						<Paper sx={{ p: 3, textAlign: 'center' }}>
							<Typography
								variant="h4"
								color="primary"
								sx={{ fontWeight: 'bold' }}
							>
								{species.birdsAggregate._count?.toLocaleString() || 0}
							</Typography>
							<Typography variant="h6" color="text.secondary">
								Individuals
							</Typography>
						</Paper>
					</Box>

					<Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
						<Paper sx={{ p: 3, textAlign: 'center' }}>
							<Typography
								variant="h4"
								color="primary"
								sx={{ fontWeight: 'bold' }}
							>
								{totalEncounters.toLocaleString()}
							</Typography>
							<Typography variant="h6" color="text.secondary">
								Encounters
							</Typography>
						</Paper>
					</Box>

					<Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
						<Paper sx={{ p: 3, textAlign: 'center' }}>
							<Typography
								variant="h4"
								color="primary"
								sx={{ fontWeight: 'bold' }}
							>
								{sessionCount.toLocaleString()}
							</Typography>
							<Typography variant="h6" color="text.secondary">
								Sessions
							</Typography>
						</Paper>
					</Box>
				</Box>
			</Box>
		</Container>
	);
}

export default async function SpeciesPage({ params }: PageProps) {
	const decodedSpeciesName = decodeURIComponent(params.speciesName);

	return <Suspense fallback={<Box display="flex" justifyContent="center" py={4}>
		<CircularProgress />
	</Box>}>
		<SpeciesDetails speciesName={decodedSpeciesName} />
	</Suspense>

}
