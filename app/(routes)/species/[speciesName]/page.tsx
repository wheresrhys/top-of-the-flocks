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
};

function getTopSessions(species: string) {
	return getTopPeriodsByMetric({
		temporal_unit: 'day',
		metric_name: 'encounters',
		species_filter: species,
		result_limit: 5
	}) as Promise<TopPeriodsResult[]>;
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
	const [topSessions, birds] = await Promise.all([
		getTopSessions(params.speciesName),
		fetchAllBirds(params.speciesName)
	]);
	if (birds.length === 0) return null;
	return {
		topSessions,
		birds
	};
}

function addProvenAgeToBirds(
	birds: BirdWithEncounters[]
): EnrichedBirdWithEncounters[] {
	return birds.map(addProvenAgeToBird);
}

function SpeciesSummary({
	params: { speciesName },
	data: { topSessions, birds }
}: {
	params: PageParams;
	data: PageData;
}) {
	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">
					{speciesName}: all records
				</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					<li>{birds.length} individuals</li>
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
					<li>
						Oldest proven bird:{' '}
						{Math.max(...birds.map((bird) => bird.provenAge))} years old
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
