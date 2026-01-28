import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import {
	SessionTable,
	type SpeciesBreakdown
} from '@/app/components/SessionTable';
import { querySupabaseForNestedList } from '@/app/lib/supabase-query';
import type { Database } from '@/types/supabase.types';

export type Encounter = Database['public']['Tables']['Encounters']['Row'] & {
	bird: {
		ring_no: string;
		species: { species_name: string };
	};
};

async function fetchSessionData(date: string) {
	return querySupabaseForNestedList<Encounter>({
		rootTable: 'Sessions',
		identityField: 'visit_date',
		identityValue: date,
		identityOperator: 'eq',
		listProperty: 'encounters',
		query: `
			id,
			encounters: Encounters(
				id,
				session_id,
				age,
				bird_id,
				capture_time,
				is_juv,
				record_type,
				sex,
				weight,
				wing_length,
				breeding_condition,
				extra_text,
				moult_code,
				old_greater_coverts,
				scheme,
				sexing_method,
				bird:Birds (
					id,
					species_id,
					ring_no,
					species:Species (
						id,
						species_name
					)
				)
			)`
	})
}

function getSpeciesBreakdown(
	encounters: Encounter[]
): SpeciesBreakdown {
	const map: Record<string, Encounter[]> = {};
	encounters.forEach((encounter) => {
		const species = encounter.bird.species.species_name;
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
	session: Encounter[];
	date: string;
}) {
	const speciesBreakdown = getSpeciesBreakdown(session);

	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">Session on {date}</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					<li>{session.length} birds</li>
					<li>{speciesBreakdown.length} species</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'N')
								.length
						}{' '}
						new
					</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'S')
								.length
						}{' '}
						retraps
					</li>
					<li>
						{session.filter((encounter) => !encounter.is_juv).length} adults
						[FIX ME!]
					</li>
					<li>
						{session.filter((encounter) => encounter.is_juv).length} juvs [FIX
						ME!]
					</li>
				</ul>
			</div>
			<SessionTable date={date} speciesBreakdown={speciesBreakdown} />
		</div>
	);
}

async function fetchSessionDataWithCache(date: string) {
	return unstable_cache(
		async () => fetchSessionData(date),
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
	const initialData = await fetchSessionDataWithCache(date);
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
