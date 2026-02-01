import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import { format as formatDate } from 'date-fns';
import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';

type PageParams = { ring: string };
type PageProps = { params: Promise<PageParams> };
type PageData = EnrichedBirdWithEncounters;

export type Encounter = Database['public']['Tables']['Encounters']['Row'] & {
	session: Database['public']['Tables']['Sessions']['Row'];
};

export type BirdWithEncounters =
	Database['public']['Tables']['Birds']['Row'] & {
		encounters: Encounter[];
		species?: {
			species_name: string;
		};
	};

export type EnrichedBirdWithEncounters = BirdWithEncounters & {
	provenAge: number;
};

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

export function pairwiseSortEncounters(
	direction: 'asc' | 'desc'
): (a: Encounter, b: Encounter) => -1 | 0 | 1 {
	return (a, b) => {
		const aTime = new Date(a.session.visit_date).getTime();
		const bTime = new Date(b.session.visit_date).getTime();
		if (aTime === bTime) return 0;
		if (direction === 'asc') return aTime > bTime ? 1 : -1;
		else return aTime < bTime ? 1 : -1;
	};
}

export function orderEncountersByRecency(
	encounters: Encounter[],
	direction: 'asc' | 'desc'
) {
	return encounters.sort(pairwiseSortEncounters(direction));
}

export function addProvenAgeToBird(
	bird: BirdWithEncounters
): EnrichedBirdWithEncounters {
	(bird as EnrichedBirdWithEncounters).provenAge =
		bird.encounters[0].minimum_years +
		new Date(
			bird.encounters[bird.encounters.length - 1].session.visit_date
		).getFullYear() -
		new Date(bird.encounters[0].session.visit_date).getFullYear();
	return bird as EnrichedBirdWithEncounters;
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
			<ul className="flex flex-wrap gap-2">
				<li className="badge badge-secondary">
					{bird?.encounters.length} Encounters
				</li>
				<li className="badge badge-secondary">
					First:{' '}
					{formatDate(
						new Date(bird?.encounters[0].session.visit_date),
						'dd MMMM yyyy'
					)}
				</li>
				<li className="badge badge-secondary">
					Last:{' '}
					{formatDate(
						new Date(
							bird?.encounters[bird?.encounters.length - 1].session.visit_date
						),
						'dd MMMM yyyy'
					)}
				</li>
				<li className="badge badge-secondary">Proven Age: {bird?.provenAge}</li>
			</ul>
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
