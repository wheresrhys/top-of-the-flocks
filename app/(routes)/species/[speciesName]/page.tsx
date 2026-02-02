import { SpeciesTable } from '@/app/components/SingleSpeciesTable';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { getTopPeriodsByMetric } from '@/app/isomorphic/stats-data-tables';
import type { TopPeriodsResult } from '@/app/components/StatOutput';
import {
	addProvenAgeToBirds,
	orderBirdsByRecency,
	type BirdWithEncounters,
	type EnrichedBirdWithEncounters
} from '@/app/lib/bird-data-helpers';

import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';
import { SpeciesHighlightStats } from '@/app/components/SpeciesHighlights';

type SpeciesLeagueTableRow =
	Database['public']['Views']['species_league_table']['Row'];
type PageParams = { speciesName: string };
type PageProps = { params: Promise<PageParams> };

export type PageData = {
	topSessions: TopPeriodsResult[];
	birds: EnrichedBirdWithEncounters[];
	speciesStats: SpeciesLeagueTableRow;
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
		.from('species_league_table')
		.select('*')
		.eq('species_name', species)
		.maybeSingle()
		.then(catchSupabaseErrors) as Promise<SpeciesLeagueTableRow>;
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
