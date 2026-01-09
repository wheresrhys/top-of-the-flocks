import { Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
// import { graphqlRequest } from '../lib/graphql-client';

// async function getSpeciesData(): Promise<HomeQuery> {
//   const response = await graphqlRequest<HomeQuery>(GET_HOME_PAGE);

//   if (response.errors) {
//     throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
//   }

//   if (!response.data) {
//     throw new Error('No data returned from GraphQL query');
//   }

//   return response.data;
// }

// async function SpeciesTableWrapper() {
//   const data = await getSpeciesData();
//   return <SortableSpeciesTable data={data.speciesLeagueTable || []} />;
// }

export default function Home() {
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 4,
            textAlign: 'center',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 'bold',
          }}
        >
          Top of the Flocks
        </Typography>

        <Suspense fallback={
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        }>
          <p>TODO: Add some records to beat</p>
        </Suspense>
      </Box>
    </Container>
  );
}
