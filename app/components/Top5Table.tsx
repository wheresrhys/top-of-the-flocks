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

import type { DocumentNode } from 'graphql';
import { graphqlRequest } from '../../lib/graphql-client';
import {
	TOP5_SESSIONS,
	TOP5_MONTHS,
	TOP5_YEARS,
	type TopSessionsResult,
	type Top5TableQuery,
} from '../../lib/queries';

export type TemporalUnit = 'day' | 'month' | 'year';

export type Top5TableConfig = {
	connectingVerb: 'in' | 'on';
	dateFormat: string;
	query: DocumentNode;
};

const top5TableConfigs: Record<TemporalUnit, Top5TableConfig> = {
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

function Top5Entry({ config, entry }: { config: Top5TableConfig; entry: TopSessionsResult }) {
	console.log({entry})
	return (
		<Typography variant="body2">
			<b>5</b> {config.connectingVerb} 2nd June 2007
		</Typography>
	);
}

// Pure presentation component - no data fetching logic
export function Top5TableDisplay({
	data,
	temporalUnit
}: {
	data: Top5TableQuery;
	temporalUnit: TemporalUnit;
}) {
	const config = top5TableConfigs[temporalUnit];
	console.log(data)
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

export async function getTop5Data(query: DocumentNode): Promise<Top5TableQuery> {
	const response = await graphqlRequest<Top5TableQuery>(query);

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
