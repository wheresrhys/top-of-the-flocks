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
	query LeagueTable(
		$temporalUnit: String1
		$numberOfEntries: Int64
		$monthFilter: Int64
		$yearFilter: Int64
	) {
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
	LeagueTableQuery,
	LeagueTableQueryVariables
} from '../../types/graphql.types';

export type TemporalUnit = 'day' | 'month' | 'year';

const connectingVerbMap: Record<TemporalUnit, 'in' | 'on'> = {
	day: 'on',
	month: 'in',
	year: 'in'
};

const dateFormatMap: Record<TemporalUnit, string> = {
	day: 'DD MMMM YYYY',
	month: 'MMMM YYYY',
	year: 'YYYY'
};

export type LeagueTableConfig = {
	temporalUnit: TemporalUnit;
};

type NullableTopPeriodsResult = TopPeriodsResult | null | undefined;

function LeagueTableEntry({
	config,
	entry
}: {
	config: LeagueTableConfig;
	entry: NullableTopPeriodsResult;
}) {
	if (!entry) return null;
	return (
		<Typography variant="body2">
			<b>{entry.metricValue}</b> {connectingVerbMap[config.temporalUnit]}{' '}
			{formatDate(
				new Date(entry.visitDate as string),
				dateFormatMap[config.temporalUnit]
			)}
		</Typography>
	);
}

function dataToMatrix(
	data: LeagueTableQuery
): [
	number,
	NullableTopPeriodsResult,
	NullableTopPeriodsResult,
	NullableTopPeriodsResult
][] {
	const matrix: [
		number,
		NullableTopPeriodsResult,
		NullableTopPeriodsResult,
		NullableTopPeriodsResult
	][] = [];
	const length =
		(data.byEncounter || data.byIndividual || data.bySpecies)?.length || 0;

	if (length === 0) {
		return matrix;
	}
	for (let i = 0; i < length; i++) {
		matrix.push([
			i + 1,
			data.byEncounter?.[i],
			data.byIndividual?.[i],
			data.bySpecies?.[i]
		]);
	}
	return matrix;
}

// Pure presentation component - no data fetching logic
export function LeagueTableDisplay({
	data,
	heading,
	config
}: {
	data: LeagueTableQuery;
	heading?: string;
	config: LeagueTableConfig;
}) {
	const matrix = dataToMatrix(data);

	if (!matrix.length) {
		return (
			<>
				<Typography variant="h6" fontWeight="bold" component="span">
					{heading}
				</Typography>
				<Typography variant="body2">No data available</Typography>
			</>
		);
	}
	return (
		<>
			<Typography variant="h6" fontWeight="bold" component="span">
				{heading}
			</Typography>
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
						{matrix.map(([rank, byEncounter, byIndividual, bySpecies]) => (
							<TableRow
								key={rank}
								sx={{
									'&:nth-of-type(odd)': {
										backgroundColor: 'action.hover'
									}
								}}
							>
								<TableCell>{rank}</TableCell>
								<TableCell>
									<LeagueTableEntry entry={byEncounter} config={config} />
								</TableCell>
								<TableCell>
									<LeagueTableEntry entry={byIndividual} config={config} />
								</TableCell>
								<TableCell>
									<LeagueTableEntry entry={bySpecies} config={config} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}

export async function getLeagueTableData(
	variables: LeagueTableQueryVariables
): Promise<LeagueTableQuery> {
	const response = await graphqlRequest<LeagueTableQuery>(
		LEAGUE_TABLE_QUERY,
		variables
	);

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
