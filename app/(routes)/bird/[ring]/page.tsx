import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import { format as formatDate } from 'date-fns';
import {
	BadgeList,
	PageWrapper,
	PrimaryHeading
} from '@/app/components/DesignSystem';
import {
	addProvenAgeToBird,
	orderEncountersByRecency,
	type EnrichedBirdWithEncounters
} from '@/app/lib/bird-data-helpers';

type PageParams = { ring: string };
type PageProps = { params: Promise<PageParams> };
type PageData = EnrichedBirdWithEncounters;

async function fetchBirdData({ ring }: PageParams) {
	const data = (await supabase
		.from('Birds')
		.select(
			`
			id,
			ring_no,
			species:Species (
				species_name
			),
			encounters:Encounters (
				id,
				age_code,
				is_juv,
				capture_time,
				minimum_years,
				record_type,
				sex,
				weight,
				wing_length,
				session:Sessions(
					visit_date
				)
		)
	`
		)
		.eq('ring_no', ring)
		.maybeSingle()
		.then(catchSupabaseErrors)) as PageData;

	if (!data) {
		return null;
	}

	data.encounters = orderEncountersByRecency(data.encounters, 'asc');
	addProvenAgeToBird(data);
	return data as EnrichedBirdWithEncounters;
}

function BirdSummary({
	params: { ring },
	data: bird
}: {
	params: PageParams;
	data: PageData;
}) {
	return (
		<PageWrapper>
			<PrimaryHeading>
				{bird?.species?.species_name} {ring}
			</PrimaryHeading>
			<BadgeList
				items={[
					`${bird?.encounters.length} encounters`,
					`First: ${formatDate(new Date(bird?.encounters[0].session.visit_date), 'dd MMMM yyyy')}`,
					`Last: ${formatDate(new Date(bird?.encounters[bird?.encounters.length - 1].session.visit_date), 'dd MMMM yyyy')}`,
					`Proven Age: ${bird?.provenAge}`
				]}
			/>
			<SingleBirdTable encounters={bird?.encounters ?? []} />
		</PageWrapper>
	);
}

export default async function BirdPage(props: PageProps) {
	return (
		<BootstrapPageData<PageData, PageProps, PageParams>
			pageProps={props}
			getParams={async (pageProps: PageProps) => ({
				ring: (await pageProps.params).ring.toUpperCase()
			})}
			getCacheKeys={(params: PageParams) => ['bird', params.ring]}
			dataFetcher={fetchBirdData}
			PageComponent={BirdSummary}
		/>
	);
}
