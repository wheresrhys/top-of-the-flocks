import { gql } from 'graphql-tag';
import {
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper
} from '@mui/material';
import formatDate from 'intl-dateformat';

import type { DocumentNode } from 'graphql';
import { graphqlRequest } from '../../lib/graphql-client';
const TOP5_TABLE_QUERY = gql`
	query Top5Table($temporalUnit: String1) {
		byEncounter: topPeriodsByMetric(
			args: { metricName: "encounters", temporalUnit: $temporalUnit }
		) {
			metricValue
			visitDate
		}
		byIndividual: topPeriodsByMetric(
			args: { metricName: "individuals", temporalUnit: $temporalUnit }
		) {
			metricValue
			visitDate
		}
		bySpecies: topPeriodsByMetric(
			args: { metricName: "species", temporalUnit: $temporalUnit }
		) {
			metricValue
			visitDate
		}
	}
`;

import type {
	TopSessionsResult,
	Top5TableQuery
} from '../../types/graphql.types';

export type TemporalUnit = 'day' | 'month' | 'year';

export type Top5TableConfig = {
	temporalUnit: TemporalUnit;
	connectingVerb: 'in' | 'on';
	dateFormat: string;
};

function Top5Entry({
	config,
	entry
}: {
	config: Top5TableConfig;
	entry: TopSessionsResult;
}) {
	return (
		<Typography variant="body2">
			<b>{entry.metricValue}</b> {config.connectingVerb}{' '}
			{formatDate(new Date(entry.visitDate as string), config.dateFormat)}
		</Typography>
	);
}

// Pure presentation component - no data fetching logic
export function Top5TableDisplay({
	data,
	config
}: {
	data: Top5TableQuery;
	config: Top5TableConfig;
}) {
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
								<Top5Entry entry={data.byEncounter[index]} config={config} />
							</TableCell>
							<TableCell>
								<Top5Entry entry={data.byIndividual[index]} config={config} />
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

export async function getTop5Data(
	temporalUnit: TemporalUnit
): Promise<Top5TableQuery> {
	const response = await graphqlRequest<Top5TableQuery>(TOP5_TABLE_QUERY, {
		temporalUnit: temporalUnit as string
	});

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
