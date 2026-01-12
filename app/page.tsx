import { Container, Box, Typography, Grid } from '@mui/material';
import AllTimeLeagueTableTabs from './components/AllTimeLeagueTableTabs';
import {
	getLeagueTableData,
	TemporalUnit,
	type LeagueTableConfig,
	LeagueTableDisplay
} from './components/LeagueTable';

export default async function Home() {
	// Fetch the first tab's data server-side
	const allTimeInitialData = await getLeagueTableData({
		temporalUnit: 'day' as TemporalUnit,
		numberOfEntries: 10
	});

	const today = new Date();

	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	// todo make lots of use fo suspense here
	const [
		bestDaysThisMonth,
		bestDaysThisMonthInAnyYear,
		bestDaysThisYear,
		bestThisMonthInAnyYear
	] = await Promise.all([
		getLeagueTableData({
			temporalUnit: 'day' as TemporalUnit,
			numberOfEntries: 5,
			monthFilter: month,
			yearFilter: year
		}),
		getLeagueTableData({
			temporalUnit: 'day' as TemporalUnit,
			numberOfEntries: 5,
			monthFilter: month
		}),
		getLeagueTableData({
			temporalUnit: 'day' as TemporalUnit,
			numberOfEntries: 5,
			yearFilter: year
		}),
		getLeagueTableData({
			temporalUnit: 'month' as TemporalUnit,
			numberOfEntries: 5,
			monthFilter: month
		})
	]);

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
							This month&apos;s records
						</Typography>
						<LeagueTableDisplay
							data={bestDaysThisMonth}
							heading="Best days this month"
							config={
								{
									temporalUnit: 'day'
								} as LeagueTableConfig
							}
						/>
						<LeagueTableDisplay
							data={bestDaysThisMonthInAnyYear}
							heading="Best days this month in any year"
							config={
								{
									temporalUnit: 'day'
								} as LeagueTableConfig
							}
						/>
						<LeagueTableDisplay
							data={bestDaysThisYear}
							heading="Best days this year"
							config={
								{
									temporalUnit: 'day'
								} as LeagueTableConfig
							}
						/>
						<LeagueTableDisplay
							data={bestThisMonthInAnyYear}
							heading="Best this months in any year"
							config={
								{
									temporalUnit: 'month'
								} as LeagueTableConfig
							}
						/>
					</Box>
				</Grid>
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
