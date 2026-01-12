import { Suspense } from 'react';
import { Container, Box, Typography, Grid, CircularProgress } from '@mui/material';
import AllTimeLeagueTableTabs from './components/AllTimeLeagueTableTabs';
import {
	getLeagueTableData,
	TemporalUnit,
	type LeagueTableConfig,
	LeagueTableDisplay
} from './components/LeagueTable';


const monthNameMap = [
	null,
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

async function MonthStats({ month, year, heading }: { month: number, year: number, heading: string }) {

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
		<Box>
			<Typography
				variant="h3"
				component="h2"
				sx={{
					mb: 4,
					textAlign: 'left'
				}}
			>
				{heading}
			</Typography>
			<LeagueTableDisplay
				data={bestDaysThisMonth}
				heading="Best days"
				config={
					{
						temporalUnit: 'day'
					} as LeagueTableConfig
				}
			/>
			<LeagueTableDisplay
				data={bestDaysThisMonthInAnyYear}
				heading={`Best ${monthNameMap[month]} days ever`}
				config={
					{
						temporalUnit: 'day'
					} as LeagueTableConfig
				}
			/>
			{/* TODO: Split the year data out into a separate thing */}
			<LeagueTableDisplay
				data={bestDaysThisYear}
				heading={`Best days this year`}
				config={
					{
						temporalUnit: 'day'
					} as LeagueTableConfig
				}
			/>
			<LeagueTableDisplay
				data={bestThisMonthInAnyYear}
				heading={`Best ever ${monthNameMap[month]}`}
				config={
					{
						temporalUnit: 'month'
					} as LeagueTableConfig
				}
			/>
		</Box>
	)
}

function getMonthAndYear(date: Date): { month: number, year: number } {
	return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function getLastMonthAndYear(date: Date): { month: number, year: number } {
	const {month, year} = getMonthAndYear(date);
	const lastMonth = month - 1;
	if (lastMonth === 0) {
		return { month: 12, year: year - 1 };
	}
	return { month: lastMonth, year };
}

export default async function Home() {
	// Fetch the first tab's data server-side
	const allTimeInitialData = await getLeagueTableData({
		temporalUnit: 'day' as TemporalUnit,
		numberOfEntries: 10
	});

	const today = new Date();

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
					<Suspense
						fallback={
							<Box display="flex" justifyContent="center" py={4}>
								<CircularProgress />
							</Box>
						}
					>
						<MonthStats {...getMonthAndYear(today)} heading="This month's records" />
					</Suspense>
					<Suspense
						fallback={
							<Box display="flex" justifyContent="center" py={4}>
								<CircularProgress />
							</Box>
						}
					>
						<MonthStats {...getLastMonthAndYear(today)} heading="Last month's records" />
					</Suspense>
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
