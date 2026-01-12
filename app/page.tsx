import { Container, Box, Typography, Grid } from '@mui/material';
import AllTimeLeagueTableTabs from './components/AllTimeLeagueTableTabs';
import { getLeagueTableData, TemporalUnit } from './components/LeagueTable';

export default async function Home() {
	// Fetch the first tab's data server-side
	const allTimeInitialData = await getLeagueTableData({
		temporalUnit: 'day' as TemporalUnit,
		numberOfEntries: 10
	});

	return (
		<Container maxWidth="xl">
			<Typography
				variant="h1"
				component="h1"
				sx={{
					mb: 4,
					textAlign: 'center'
				}}
			>
				Top of the Flocks
			</Typography>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 6 }}></Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Box>
						<Typography
							variant="h3"
							component="h2"
							sx={{
								mb: 4,
								textAlign: 'left'
							}}
						>
							All time records
						</Typography>

						<AllTimeLeagueTableTabs
							initialData={allTimeInitialData}
							numberOfEntries={10}
						/>
					</Box>
				</Grid>
			</Grid>
		</Container>
	);
}
