'use client';

import { Suspense, useState, SyntheticEvent, ReactNode } from 'react';
import {
	Box,
	Typography,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper
} from '@mui/material';

import { graphqlRequest } from '../../lib/graphql-client';
import {
	TOP5_SESSIONS,
	TOP5_MONTHS,
	TOP5_YEARS,
	type TopSessionsResult
} from '../../lib/queries';


type Top5TableData = {
	byEncounters: [TopSessionsResult];
	byIndividuals: [TopSessionsResult];
	bySpecies: [TopSessionsResult];
};

// TODO use the gql string template modifier
async function getTop5Data(query: string): Promise<Top5TableData> {
	const response = await graphqlRequest<Top5TableData>(query);

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

type TemporalUnit = 'day' | 'month' | 'year';

type Top5TableProps = {
	temporalUnit: TemporalUnit;
};
type Top5TableConfig = {
	connectingVerb: 'in' | 'on';
	dateFormat: string;
	query: string;
};
const top5TableConfigs: { [key: TemporalUnit]: Top5TableConfig } = {
	day: {
		connectingVerb: 'on',
		dateFormat: 'dd MMM YYYY',
		query: TOP5_SESSIONS
	},
	month: {
		connectingVerb: 'in',
		dateFormat: 'MMM YYYY',
		query: TOP5_MONTHS
	},
	year: {
		connectingVerb: 'in',
		dateFormat: 'YYYY',
		query: TOP5_YEARS
	}
};

function Top5Entry({ config: Top5TableConfig, entry: TopSessionsResult }) {
	return (
		<Typography variant="body2">
			<b>5</b> {config.connectingVerb} 2nd June 2007
		</Typography>
	);
}

// TODO can use generated type from GraphQL for data
function Top5Table({ data: Top5TableData, config: Top5TableConfig }) {
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
					{[...Array(5)].map((_, index) => (
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
								<Top5Entry entry={data.byEncounters[index]} config={config} />
							</TableCell>
							<TableCell>
								<Top5Entry entry={data.byIndividuals[index]} config={config} />
							</TableCell>
							<TableCell>
								<Top5Entry entry={data.bySpecies[index]} config={config} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

async function Top5TableWrapper(props: Top5TableProps) {
	const config = top5TableConfigs[props.temporalUnit];
	const data = await getTop5Data(config.query);
	return <Top5Table data={data || {}} config={config} />;
}

export default function Top5TableLoader(props: Top5TableProps) {
	return (
		<Suspense
			fallback={
				<Box display="flex" justifyContent="center" py={4}>
					<CircularProgress />
				</Box>
			}
		>
			<Top5TableWrapper {...props} />
		</Suspense>
	);
}
