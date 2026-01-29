import {
	SpeciesTable
} from '@/app/components/SingleSpeciesTable';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import {querySupabaseForNestedList} from '@/app/lib/supabase-query';
import type { Database } from '@/types/supabase.types';

type PageParams = { speciesName: string }
type PageProps = { params: Promise<PageParams> }

type Encounter = (Database['public']['Tables']['Encounters']['Row'] & {
	session: Database['public']['Tables']['Sessions']['Row'];
})

export type BirdWithEncounters = Database['public']['Tables']['Birds']['Row'] & {
	encounters: Encounter[];
};

export async function fetchSpeciesData(params: PageParams) {
	return querySupabaseForNestedList<BirdWithEncounters>({
		rootTable: 'Species',
		identityField: 'species_name',
		identityValue: params.speciesName,
		identityOperator: 'ilike',
		listProperty: 'birds',
		query: `
		birds:Birds (
			id,
			ring_no,
			encounters:Encounters (
				id,
				age,
				capture_time,
				record_type,
				sex,
				weight,
				wing_length,
				session:Sessions(
				visit_date
				)
			)
		)
		`,
	})
}

function SpeciesSummary({
	params: { speciesName },
	data:birds
}: {
	params: PageParams;
	data: BirdWithEncounters[];
}) {
	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">
					{speciesName}: all records
				</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					<li>{birds.length} individuals</li>
				</ul>
			</div>
			<SpeciesTable birds={birds} />
		</div>
	);
}


export default async function SpeciesPage(props: PageProps) {
	return (
		<BootstrapPageData<BirdWithEncounters[], PageProps, PageParams>
			pageProps={props}
			getCacheKeys={(params: PageParams) => ['species', params.speciesName]}
			dataFetcher={fetchSpeciesData}
			PageComponent={SpeciesSummary}
		/>
	);
}
