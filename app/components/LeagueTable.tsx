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

import { graphqlRequest } from '../../lib/graphql-client';
const LEAGUE_TABLE_QUERY = gql`
	query LeagueTable($temporalUnit: String1, $numberOfEntries: Int64, $monthFilter: Int64, $yearFilter: Int64) {
		byEncounter: topPeriodsByMetric(
			args: {
				metricName: "encounters"
				temporalUnit: $temporalUnit
				resultLimit: $numberOfEntries
				monthFilter: $monthFilter
				yearFilter: $yearFilter
			}
		) {
			metricValue
			visitDate
		}
		byIndividual: topPeriodsByMetric(
			args: {
				metricName: "individuals"
				temporalUnit: $temporalUnit
				resultLimit: $numberOfEntries
				monthFilter: $monthFilter
				yearFilter: $yearFilter
			}
		) {
			metricValue
			visitDate
		}
		bySpecies: topPeriodsByMetric(
			args: {
				metricName: "species"
				temporalUnit: $temporalUnit
				resultLimit: $numberOfEntries
				monthFilter: $monthFilter
				yearFilter: $yearFilter
			}
		) {
			metricValue
			visitDate
		}
	}
`;

import type {
	TopPeriodsResult,
	LeagueTableQuery
} from '../../types/graphql.types';

export type TemporalUnit = 'day' | 'month' | 'year';

export type LeagueTableConfig = {
	temporalUnit: TemporalUnit;
	connectingVerb: 'in' | 'on';
	dateFormat: string;
	monthFilter?: number;
	yearFilter?: number;
};

function LeagueTableEntry({
	config,
	entry
}: {
	config: LeagueTableConfig;
	entry: TopPeriodsResult | null | undefined;
}) {
	if (!entry) return null;
	return (
		<Typography variant="body2">
			<b>{entry.metricValue}</b> {config.connectingVerb}{' '}
			{formatDate(new Date(entry.visitDate as string), config.dateFormat)}
		</Typography>
	);
}

// Pure presentation component - no data fetching logic
export function LeagueTableDisplay({
	data,
	config,
	numberOfEntries
}: {
	data: LeagueTableQuery;
	config: LeagueTableConfig;
	numberOfEntries: number;
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
					{[...Array(numberOfEntries)].map((_, index) => (
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
								<LeagueTableEntry
									entry={data.byEncounter?.[index]}
									config={config}
								/>
							</TableCell>
							<TableCell>
								<LeagueTableEntry
									entry={data.byIndividual?.[index]}
									config={config}
								/>
							</TableCell>
							<TableCell>
								<LeagueTableEntry
									entry={data.bySpecies?.[index]}
									config={config}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export async function getLeagueTableData(
	temporalUnit: TemporalUnit,
	numberOfEntries: number
): Promise<LeagueTableQuery> {
	const response = await graphqlRequest<LeagueTableQuery>(LEAGUE_TABLE_QUERY, {
		temporalUnit: temporalUnit as string,
		numberOfEntries: numberOfEntries
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
