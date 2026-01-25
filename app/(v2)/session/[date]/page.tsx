import { Suspense } from 'react';
import { graphqlRequest, type GraphQLResponse } from '@/lib/graphql-client';
import gql from 'graphql-tag';
import { unstable_cache } from 'next/cache';
import { GetSessionByDateQuery } from '@/types/graphql.types';
import { notFound } from 'next/navigation';
import { List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
type SessionData = NonNullable<GetSessionByDateQuery['sessions']>[number];
type EncounterData = NonNullable<SessionData['encounters']>[number];
const GET_SESSION_BY_DATE = gql`
	query GetSessionByDate($date: Date) {
		sessions(where: { visitDate: { _eq: $date } }) {
			encounters {
				age
				captureTime
				isJuv
				recordType
				sex
				weight
				wingLength
				bird {
					ringNo
					species {
						speciesName
					}
				}
			}
		}
	}
`;

function getSpeciesBreakdown(session: SessionData) {
	const map: Record<string, EncounterData[]> = {};
	// @ts-expect-error - db schema forbids null
	session.encounters.forEach(encounter => {

		const species = encounter.bird?.species?.speciesName;
		// @ts-expect-error - db schema forbids null
		map[species] = map[species] || [];
		// @ts-expect-error - db schema forbids null
		map[species].push(encounter);
	});
	return Object.entries(map).map(([species, encounters]) => ({ species, encounters })).sort((a, b) => {
		if (a.encounters.length === b.encounters.length) {
			return 0;
		}
		return a.encounters.length < b.encounters.length ? 1 : -1;
	});
}

function SessionSummary({ session, date }: { session: SessionData, date: string }) {

	const speciesBreakdown = getSpeciesBreakdown(session);
	return (
		<div>
			<h1>
			Session on {date}
		</h1>
		<List>
				<ListItem><ListItemText>{session.encounters?.length} birds</ListItemText></ListItem>
		<ListItem><ListItemText>{speciesBreakdown.length} species</ListItemText></ListItem>
		{/* @ts-expect-error - db schema forbids null */}
		<ListItem><ListItemText>{session.encounters.filter(encounter => encounter.recordType === 'N').length} new</ListItemText></ListItem>
		{/* @ts-expect-error - db schema forbids null */}
		<ListItem><ListItemText>{session.encounters.filter(encounter => encounter.recordType === 'S').length} retraps</ListItemText></ListItem>
		{/* @ts-expect-error - db schema forbids null */}
		<ListItem><ListItemText>{session.encounters.filter(encounter => !encounter.isJuv).length} adults [FIX ME!]</ListItemText></ListItem>
		{/* @ts-expect-error - db schema forbids null */}
		<ListItem><ListItemText>{session.encounters.filter(encounter => encounter.isJuv).length} juvs [FIX ME!]</ListItemText></ListItem>
			</List>
		<Table>
			<TableHead>
				<TableRow>
						<TableCell>Species</TableCell>
					<TableCell>New</TableCell>
					<TableCell>Retraps</TableCell>
					<TableCell>Adults</TableCell>
					<TableCell>Juvs</TableCell>
						</TableRow>
			</TableHead>
			<TableBody>
				{speciesBreakdown.map(({ species, encounters }) => (
					<TableRow key={species}>
						<TableCell>{species}</TableCell>
							<TableCell>{encounters.filter(encounter => encounter.recordType === 'N').length}</TableCell>
						<TableCell>{encounters.filter(encounter => encounter.recordType === 'S').length}</TableCell>
						<TableCell>{encounters.filter(encounter => !encounter.isJuv).length}</TableCell>
						<TableCell>{encounters.filter(encounter => encounter.isJuv).length}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	</div>);
}

async function fetchSessionByDate(date: string) {
	const { data }: GraphQLResponse<GetSessionByDateQuery> =
		await graphqlRequest<GetSessionByDateQuery>(GET_SESSION_BY_DATE, { date });
	console.log('daaa', data);
	if (!data) {
		throw new Error('Failed to fetch data');
	}
	return data?.sessions?.[0];
}

async function fetchInitialDataWithCache(date: string) {
	return unstable_cache(
		async () => fetchSessionByDate(date),
		['session', date],
		{
			revalidate: 3600 * 24 * 7,
			tags: ['session', date]
		}
	)();
}

async function DisplayInitialData({
	paramsPromise
}: {
	paramsPromise: Promise<{ date: string }>;
}) {
	const { date } = await paramsPromise;
	const initialData = await fetchInitialDataWithCache(date);
	if (!initialData) {
		notFound();
	}
	return (
		<SessionSummary session={initialData} date={date} />
	);
}

export default async function SessionPage({
	params: paramsPromise
}: {
	params: Promise<{ date: string }>;
}) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DisplayInitialData paramsPromise={paramsPromise} />
		</Suspense>
	);
}
