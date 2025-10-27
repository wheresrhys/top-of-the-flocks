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
import { GetSpeciesWithCountsQuery, GetSpeciesWithCountsQueryVariables } from '../types/graphql.types';

const GET_SPECIES_WITH_COUNTS = `
  query GetSpeciesWithCounts {
    species {
      speciesName
      birdsAggregate {
        _count
      }
      birds {
        encountersAggregate {
          _count
        }
      }
    }
  }
`;

async function getSpeciesData(): Promise<GetSpeciesWithCountsQuery> {
  const response = await graphqlRequest<GetSpeciesWithCountsQuery>(GET_SPECIES_WITH_COUNTS);
  
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
  
  // Calculate totals and sort by bird count in descending order
  const speciesWithTotals = data.species
    ? data.species.map(species => ({
        speciesName: species.speciesName,
        birdCount: species.birdsAggregate._count || 0,
        encounterCount: species.birds?.reduce((sum, bird) => 
          sum + (bird.encountersAggregate._count || 0), 0) || 0
      })).sort((a, b) => b.birdCount - a.birdCount)
    : [];

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" fontWeight="bold">
                Species Name
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Bird Count
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" fontWeight="bold">
                Encounters
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {speciesWithTotals.map((species, index) => (
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
                  href={`/species/${encodeURIComponent(species.speciesName)}`}
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
                <Typography variant="body1" fontWeight="medium">
                  {species.birdCount.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1" fontWeight="medium">
                  {species.encounterCount.toLocaleString()}
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
    <Container maxWidth="lg">
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
