import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import {
	getTopPeriodsByMetric,
	type TopPeriodsResult
} from '@/app/isomorphic/stats-data-tables';
import {
	orderBirdsByRecency,
	enrichBird,
	type BirdWithEncounters,
	type EnrichedBirdWithEncounters,
	type Encounter
} from '@/app/lib/bird-model';
import { SpeciesPageWithFilters } from '@/app/components/SpeciesPageWithFilters';
import { SPECIES_PAGE_BATCH_SIZE } from '@/app/isomorphic/constants';
type SpeciesStatsRow = Database['public']['Views']['SpeciesStats']['Row'];
type PaginatedBirdsResult =
	Database['public']['Functions']['paginated_birds_table']['Returns'][number];
type PageParams = { speciesName: string };
type PageProps = { params: Promise<PageParams> };

export type PageData = {
	topSessions: TopPeriodsResult[];
	birds: EnrichedBirdWithEncounters[];
	speciesStats: SpeciesStatsRow;
};

function getTopSessions(species: string) {
	return getTopPeriodsByMetric({
		temporal_unit: 'day',
		metric_name: 'encounters',
		species_filter: species,
		result_limit: 5
	}) as Promise<TopPeriodsResult[]>;
}

async function getSpeciesStats(species: string) {
	return supabase
		.from('SpeciesStats')
		.select('*')
		.eq('species_name', species)
		.maybeSingle()
		.then(catchSupabaseErrors) as Promise<SpeciesStatsRow>;
}

function convertPaginatedBirdResultsToBirds(
	paginatedBirdResults: PaginatedBirdsResult[]
): BirdWithEncounters[] {
	const birdsMap: Record<string, BirdWithEncounters> = {};
	paginatedBirdResults.forEach((result) => {
		if (!birdsMap[result.ring_no]) {
			birdsMap[result.ring_no] = {
				id: result.bird_id,
				ring_no: result.ring_no,
				encounters: [] as Encounter[]
			} as BirdWithEncounters;
		}
		birdsMap[result.ring_no].encounters.push({
			id: result.encounter_id,
			capture_time: result.capture_time,
			is_juv: result.is_juv,
			minimum_years: result.minimum_years,
			record_type: result.record_type,
			sex: result.sex,
			weight: result.weight,
			wing_length: result.wing_length,
			session: {
				id: result.session_id,
				visit_date: result.visit_date
			}
		} as Encounter);
	});
	return Object.values(birdsMap);
}

async function fetchAllBirds(species: string) {
	const paginatedBirdResults = (await supabase
		.rpc('paginated_birds_table', {
			species_name_param: species,
			result_limit: SPECIES_PAGE_BATCH_SIZE,
			result_offset: 0
		})
		.then(catchSupabaseErrors)) as PaginatedBirdsResult[];

	return orderBirdsByRecency<EnrichedBirdWithEncounters>(
		convertPaginatedBirdResultsToBirds(paginatedBirdResults).map(enrichBird),
		{
			direction: 'desc',
			type: 'last',
			encountersAlreadySorted: true
		}
	);
}

async function fetchSpeciesData(params: PageParams): Promise<PageData | null> {
	const [topSessions, birds, speciesStats] = await Promise.all([
		getTopSessions(params.speciesName),
		fetchAllBirds(params.speciesName),
		getSpeciesStats(params.speciesName)
	]);
	if (birds.length === 0) return null;
	return {
		topSessions,
		birds,
		speciesStats
	};
}

export default async function SpeciesPage(props: PageProps) {
	return (
		<BootstrapPageData<PageData, PageProps, PageParams>
			pageProps={props}
			getCacheKeys={(params: PageParams) => ['species', params.speciesName]}
			dataFetcher={fetchSpeciesData}
			PageComponent={SpeciesPageWithFilters}
		/>
	);
}
