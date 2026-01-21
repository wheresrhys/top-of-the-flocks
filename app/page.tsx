import { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import {
	Container,
	Box,
	Typography,
	Grid,
	CircularProgress
} from '@mui/material';
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

async function MonthStats({
	monthOffset,
	heading
}: {
	monthOffset: number;
	heading: string;
}) {
	'use cache';
	cacheLife('hours');
	const { month, year } = getMonthAndYear(monthOffset);
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
	);
}

function getMonthAndYear(monthOffset: number): { month: number; year: number } {
	const date = new Date();
	date.setMonth(date.getMonth() + monthOffset);
	return { month: date.getMonth() + 1, year: date.getFullYear() };
}

async function AllTimeLeagueTableTabsWrapper() {
	'use cache';
	cacheLife('hours');
	const allTimeInitialData = await getLeagueTableData({
		temporalUnit: 'day' as TemporalUnit,
		numberOfEntries: 10
	});
	return (
		<AllTimeLeagueTableTabs
			initialData={allTimeInitialData}
			numberOfEntries={10}
		/>
	);
}

export default function Home() {

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
						<MonthStats
							monthOffset={0}
							heading="This month's records"
						/>
					</Suspense>
					<Suspense
						fallback={
							<Box display="flex" justifyContent="center" py={4}>
								<CircularProgress />
							</Box>
						}
					>
						<MonthStats
							monthOffset={-1}
							heading="Last month's records"
						/>
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
						<Suspense
							fallback={
								<Box display="flex" justifyContent="center" py={4}>
									<CircularProgress />
								</Box>
							}
						>
							<AllTimeLeagueTableTabsWrapper />
						</Suspense>
					</Box>
				</Grid>
			</Grid>
		</Container>
	);
}
