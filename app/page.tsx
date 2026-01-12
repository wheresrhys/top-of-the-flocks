import { Container, Box, Typography } from '@mui/material';
import AllTimeLeagueTableTabs from './components/AllTimeLeagueTableTabs';
import { getLeagueTableData, TemporalUnit } from './components/LeagueTable';

export default async function Home() {
	// Fetch the first tab's data server-side
	const allTimeInitialData = await getLeagueTableData('day' as TemporalUnit, 10);
	return (
		<Container maxWidth="xl">
			<Box
				sx={{
					minHeight: '100vh',
					py: 4
				}}
			>
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

				<AllTimeLeagueTableTabs initialData={allTimeInitialData} numberOfEntries={10} />
			</Box>
		</Container>
	);
}
