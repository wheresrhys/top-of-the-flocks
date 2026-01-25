import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import {
	List,
	ListItem,
	ListItemText,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow
} from '@mui/material';
import {
	fetchSessionDataByDate,
	type EncounterWithRelations
} from '@/app/(v2)/api/session';

function getSpeciesBreakdown(encounters: EncounterWithRelations[]) {
	const map: Record<string, EncounterWithRelations[]> = {};
	encounters.forEach((encounter) => {
		const species = encounter.species_name;
		map[species] = map[species] || [];
		map[species].push(encounter);
	});
	return Object.entries(map)
		.map(([species, encounters]) => ({ species, encounters }))
		.sort((a, b) => {
			if (a.encounters.length === b.encounters.length) {
				return 0;
			}
			return a.encounters.length < b.encounters.length ? 1 : -1;
		});
}

function SessionSummary({
	session,
	date
}: {
	session: EncounterWithRelations[];
	date: string;
}) {
	const speciesBreakdown = getSpeciesBreakdown(session);
	return (
		<div>
			<h1>Session on {date}</h1>
			<List>
				<ListItem>
					<ListItemText>{session.length} birds</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>{speciesBreakdown.length} species</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>
						{
							session.filter((encounter) => encounter.record_type === 'N')
								.length
						}{' '}
						new
					</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>
						{
							session.filter((encounter) => encounter.record_type === 'S')
								.length
						}{' '}
						retraps
					</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>
						{session.filter((encounter) => !encounter.is_juv).length} adults
						[FIX ME!]
					</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>
						{session.filter((encounter) => encounter.is_juv).length} juvs [FIX
						ME!]
					</ListItemText>
				</ListItem>
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
							<TableCell>
								{
									encounters.filter(
										(encounter) => encounter.record_type === 'N'
									).length
								}
							</TableCell>
							<TableCell>
								{
									encounters.filter(
										(encounter) => encounter.record_type === 'S'
									).length
								}
							</TableCell>
							<TableCell>
								{encounters.filter((encounter) => !encounter.is_juv).length}
							</TableCell>
							<TableCell>
								{encounters.filter((encounter) => encounter.is_juv).length}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

async function fetchInitialDataWithCache(date: string) {
	return unstable_cache(
		async () => fetchSessionDataByDate(date),
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
	const initialData = await fetchSessionDataByDate(date);
	if (!initialData) {
		notFound();
	}
	return <SessionSummary session={initialData} date={date} />;
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
