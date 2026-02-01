import { SpeciesTable } from '@/app/components/SingleSpeciesTable';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { getTopPeriodsByMetric } from '@/app/isomorphic/stats-data-tables';
import type { TopPeriodsResult } from '@/app/components/StatOutput';
import {
	addProvenAgeToBird,
	pairwiseSortEncounters,
	orderEncountersByRecency,
	type BirdWithEncounters,
	type EnrichedBirdWithEncounters
} from '@/app/(routes)/bird/[ring]/page';
import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';
import { SpeciesHighlightStats } from '@/app/components/SpeciesHighlights';

type PageParams = { speciesName: string };
type PageProps = { params: Promise<PageParams> };
export type PageData = {
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

function SpeciesSummary({
	params: { speciesName },
	data
}: {
	params: PageParams;
	data: PageData;
}) {
	return (
		<PageWrapper>
			<PrimaryHeading>{speciesName}</PrimaryHeading>
			<SpeciesHighlightStats {...data} />
			<SpeciesTable birds={data.birds} />
		</PageWrapper>
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
