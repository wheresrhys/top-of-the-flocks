'use client';

import { Suspense, useState, SyntheticEvent, ReactNode } from 'react';
import {
	Container,
	Box,
	Typography,
	CircularProgress,
	Tab,
	Tabs,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper
} from '@mui/material';
interface TabPanelProps {
	children?: ReactNode;
	index: number;
	value: number;
}

function Top5Table() {
	return (
		<TableContainer component={Paper} elevation={2}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell component="th" scope="column">
							<Typography
								variant="h6"
								fontWeight="bold"
								component="span"
								sx={{ display: 'none' }}
							>
								Rank
							</Typography>
						</TableCell>
						<TableCell component="th" scope="column">
							<Typography variant="h6" fontWeight="bold" component="span">
								Encounters
							</Typography>
						</TableCell>
						<TableCell component="th" scope="column">
							<Typography variant="h6" fontWeight="bold" component="span">
								Individuals
							</Typography>
						</TableCell>
						<TableCell component="th" scope="column">
							<Typography variant="h6" fontWeight="bold" component="span">
								Species
							</Typography>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{[...Array(5)].map((species, index) => (
						<TableRow
							key={index}
							sx={{
								'&:nth-of-type(odd)': {
									backgroundColor: 'action.hover'
								}
							}}
						>
							<TableCell component="th" scope="row">
								<Typography
									variant="body1"
									sx={{
										color: 'primary.main',
										fontWeight: 'bold'
									}}
								>
									{index + 1}
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="body2">
									<b>5</b> on/in 2nd June 2007
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="body2">text</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="body2">text</Typography>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`
	};
}

// import { graphqlRequest } from '../lib/graphql-client';

// async function getSpeciesData(): Promise<AllSpeciesStatsQuery> {
//   const response = await graphqlRequest<AllSpeciesStatsQuery>(GET_ALL_SPECIES_STATS);

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
	const [value, setValue] = useState(0);

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

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

				<Suspense
					fallback={
						<Box display="flex" justifyContent="center" py={4}>
							<CircularProgress />
						</Box>
					}
				>
					<Box sx={{ width: { xs: '100%', md: '50%' } }}>
						<Typography
							variant="h3"
							component="h2"
							sx={{
								mb: 4,
								textAlign: 'left'
							}}
						>
							Top 5
						</Typography>

						<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
							<Tabs
								value={value}
								onChange={handleChange}
								aria-label="basic tabs example"
							>
								<Tab label="Sessions" {...a11yProps(0)} />
								<Tab label="Months" {...a11yProps(1)} />
								<Tab label="Years" {...a11yProps(2)} />
							</Tabs>
						</Box>
						<CustomTabPanel value={value} index={0}>
							<Top5Table />
						</CustomTabPanel>
						<CustomTabPanel value={value} index={1}>
							<Top5Table />
						</CustomTabPanel>
						<CustomTabPanel value={value} index={2}>
							<Top5Table />
						</CustomTabPanel>
					</Box>
				</Suspense>
			</Box>
		</Container>
	);
}
