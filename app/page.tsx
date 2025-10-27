import { Suspense } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { graphqlRequest } from '../lib/graphql-client';
import { GET_HOME_PAGE, type HomeQuery } from '../lib/queries';

async function getSpeciesData(): Promise<HomeQuery> {
  const response = await graphqlRequest<HomeQuery>(GET_HOME_PAGE);

  if (response.errors) {
    throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
  }

  if (!response.data) {
    throw new Error('No data returned from GraphQL query');
  }

  return response.data;
}

async function SpeciesTable() {
  const data = await getSpeciesData();

  // Sort by individuals count in descending order (or you can choose a different sorting field)
  const sortedSpecies = data.speciesLeagueTable
    ? [...data.speciesLeagueTable].sort((a, b) => (b.individuals || 0) - (a.individuals || 0))
    : [];

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" fontWeight="bold">
                Species Name
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Individuals
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Encounters
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Session Count
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Frequent Flyer
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Longest Stay
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Unluckiest
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Heaviest
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Lightest
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Total Weight
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Longest Winged
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Shortest Winged
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedSpecies.map((species, index) => (
            <TableRow
              key={species.speciesName}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <TableCell component="th" scope="row">
                <Link
                  href={`/species/${encodeURIComponent(species.speciesName || '')}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {species.speciesName}
                  </Typography>
                </Link>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.individuals?.toLocaleString() || 0}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.encounters?.toLocaleString() || 0}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.sessionCount?.toLocaleString() || 0}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.frequentFlyer || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.longestStay || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.unluckiest || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.heaviest ? `${species.heaviest}g` : '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.lightest ? `${species.lightest}g` : '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.totalWeight ? `${species.totalWeight}g` : '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.longestWinged ? `${species.longestWinged}mm` : '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {species.shortestWinged ? `${species.shortestWinged}mm` : '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

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
          <SpeciesTable />
        </Suspense>
      </Box>
    </Container>
  );
}
