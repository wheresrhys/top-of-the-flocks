import { SpeciesTable } from '@/app/components/SingleSpeciesTable';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import {
	getTopPeriodsByMetric,
	type TopPeriodsResult
} from '@/app/lib/stats-accordion';
import Link from 'next/link';
import formatDate from 'intl-dateformat';
import {
	addProvenAgeToBird,
	pairwiseSortEncounters,
	orderEncountersByRecency,
	type BirdWithEncounters,
	type EnrichedBirdWithEncounters
} from '@/app/(routes)/bird/[ring]/page';

type PageParams = { speciesName: string };
type PageProps = { params: Promise<PageParams> };
type PageData = {
	topSessions: TopPeriodsResult[];
	birds: EnrichedBirdWithEncounters[];
	mostCaughtBirds: MostCaughtBirdsResult[];
};
type MostCaughtBirdsResult =
	Database['public']['Functions']['most_caught_birds']['Returns'][number];

function getTopSessions(species: string) {
	return getTopPeriodsByMetric({
		temporal_unit: 'day',
		metric_name: 'encounters',
		species_filter: species,
		result_limit: 5
	}) as Promise<TopPeriodsResult[]>;
}

async function getMostCaughtBirds(
	species: string
): Promise<MostCaughtBirdsResult[]> {
	const birds = await supabase
		.rpc('most_caught_birds', {
			species_filter: species,
			result_limit: 5
		})
		.then(catchSupabaseErrors);

	return birds?.filter(
		(bird) => bird.encounters > 1
	) as MostCaughtBirdsResult[];
}

async function fetchAllBirds(species: string) {
	const data = (await supabase
		.from('Species')
		.select(
			`
		birds:Birds (
			id,
			ring_no,
			encounters:Encounters (
				id,
				age_code,
				capture_time,
				is_juv,
				minimum_years,
				record_type,
				sex,
				weight,
				wing_length,
				session:Sessions(
					visit_date
				)
			)
		)
	`
		)
		.eq('species_name', species)
		.maybeSingle()
		.then(catchSupabaseErrors)) as {
		birds: BirdWithEncounters[];
	} | null;
	if (!data) {
		return [] as EnrichedBirdWithEncounters[];
	}
	return addProvenAgeToBirds(orderBirdsByRecency(data.birds, 'desc', 'last'));
}

function orderBirdsByRecency(
	birds: BirdWithEncounters[],
	direction: 'asc' | 'desc',
	type: 'first' | 'last'
) {
	return birds.sort((a, b) => {
		// note that to avoid confusion, encounters are always sorted from first to last, so that the most recent encounter is the last one
		a.encounters = orderEncountersByRecency(a.encounters, 'asc');
		b.encounters = orderEncountersByRecency(b.encounters, 'asc');
		return pairwiseSortEncounters(direction)(
			a.encounters[type === 'first' ? 0 : a.encounters.length - 1],
			b.encounters[type === 'first' ? 0 : b.encounters.length - 1]
		);
	});
}

async function fetchSpeciesData(params: PageParams): Promise<PageData | null> {
	const [topSessions, birds, mostCaughtBirds] = await Promise.all([
		getTopSessions(params.speciesName),
		fetchAllBirds(params.speciesName),
		getMostCaughtBirds(params.speciesName)
	]);
	if (birds.length === 0) return null;
	return {
		topSessions,
		birds,
		mostCaughtBirds
	};
}

function addProvenAgeToBirds(
	birds: BirdWithEncounters[]
): EnrichedBirdWithEncounters[] {
	return birds.map(addProvenAgeToBird);
}

function MostCaughtBird({
	ring,
	allBirds
}: {
	ring: string;
	allBirds: EnrichedBirdWithEncounters[];
}) {
	const bird = allBirds.find(
		(bird) => bird.ring_no === ring
	) as EnrichedBirdWithEncounters;

	return (
		<li>
			<Link className="link" href={`/bird/${bird.ring_no}`}>
				{bird.ring_no}
			</Link>
			: {bird.encounters.length} encounters,{' '}
			<span>
				{formatDate(
					new Date(bird.encounters[0].session.visit_date as string),
					'DD MMMM, YYYY'
				)}{' '}
				-{' '}
				{formatDate(
					new Date(
						bird.encounters[bird.encounters.length - 1].session
							.visit_date as string
					),
					'DD MMMM, YYYY'
				)}
				, proven age: {bird.provenAge} years
			</span>
		</li>
	);
}

function SpeciesSummary({
	params: { speciesName },
	data: { topSessions, birds, mostCaughtBirds }
}: {
	params: PageParams;
	data: PageData;
}) {
	const oldestBirdAge = Math.max(...birds.map((bird) => bird.provenAge));
	const oldestBirds =
		oldestBirdAge > 1
			? birds.filter((bird) => bird.provenAge === oldestBirdAge)
			: [];
	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">
					{speciesName}: all records
				</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					<li>{birds.length} individuals</li>
					<li>
						Oldest proven age: {oldestBirdAge} years old:{' '}
						<ul>
							{oldestBirds.map((bird) => (
								<li key={bird.ring_no}>
									<Link className="link" href={`/bird/${bird.ring_no}`}>
										{bird.ring_no}
									</Link>
								</li>
							))}
						</ul>
					</li>
					{mostCaughtBirds?.length > 0 ? (
						<li>
							Most caught birds:
							<ol>
								{mostCaughtBirds.map((bird) => (
									<MostCaughtBird
										key={bird.ring_no}
										ring={bird.ring_no}
										allBirds={birds}
									/>
								))}
							</ol>
						</li>
					) : null}
					<li>
						Top 5 sessions by encounters:
						<ol>
							{topSessions.map((session) => (
								<li key={session.visit_date}>
									{session.metric_value} on{' '}
									<Link
										className="link"
										href={`/session/${session.visit_date}`}
									>
										{formatDate(
											new Date(session.visit_date as string),
											'DD MMMM, YYYY'
										)}
									</Link>
								</li>
							))}
						</ol>
					</li>
				</ul>
			</div>
			<SpeciesTable birds={birds} />
		</div>
	);
}

export default async function SpeciesPage(props: PageProps) {
	return (
		<BootstrapPageData<PageData, PageProps, PageParams>
			pageProps={props}
			getCacheKeys={(params: PageParams) => ['species', params.speciesName]}
			dataFetcher={fetchSpeciesData}
			PageComponent={SpeciesSummary}
		/>
	);
}
