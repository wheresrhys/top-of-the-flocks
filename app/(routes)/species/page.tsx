import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import type { Database } from '@/types/supabase.types';
import Link from 'next/link';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import { Table } from '@/app/components/DesignSystem';
type SpeciesStatsRow = Database['public']['Views']['SpeciesStats']['Row'];

type SpeciesStatsColumnConfig = {
	label: string;
	Component?: (value: string | number) => React.ReactNode;
	accessor: keyof SpeciesStatsRow;
};

const speciesStatsColumns: SpeciesStatsColumnConfig[] = [
	{
		label: 'Species',
		accessor: 'species_name',
		// @ts-expect-error - TODO: fix this
		Component: (speciesName: string) => (
			<Link className="link text-wrap" href={`/species/${speciesName}`}>
				{speciesName}
			</Link>
		)
	},
	{ label: 'Birds', accessor: 'bird_count' },
	{ label: 'Encounters', accessor: 'encounter_count' },
	{ label: 'Sessions', accessor: 'session_count' },
	{ label: 'Max per session', accessor: 'max_per_session' },
	{ label: '% Birds retrapped', accessor: 'pct_retrapped' },
	{ label: 'Max time span', accessor: 'max_time_span' },
	{ label: 'Max proven age', accessor: 'max_proven_age' },
	{ label: 'Max encountered bird', accessor: 'max_encountered_bird' },
	{ label: 'Max weight', accessor: 'max_weight' },
	{ label: 'Avg weight', accessor: 'avg_weight' },
	{ label: 'Min weight', accessor: 'min_weight' },
	{ label: 'Median weight', accessor: 'median_weight' },
	{ label: 'Max wing', accessor: 'max_wing' },
	{ label: 'Avg wing', accessor: 'avg_wing' },
	{ label: 'Min wing', accessor: 'min_wing' },
	{ label: 'Median wing', accessor: 'median_wing' }
];

export async function fetchSpeciesData(): Promise<SpeciesStatsRow[]> {
	return supabase
		.from('SpeciesStats')
		.select('*')
		.order('encounter_count', { ascending: false })
		.then(catchSupabaseErrors) as Promise<SpeciesStatsRow[]>;
}

function SpeciesStatsTable({ data }: { data: SpeciesStatsRow[] }) {
	return (
		<Table>
			<thead>
				<tr>
					{speciesStatsColumns.map((column) => (
						<th className="text-wrap" key={column.accessor}>
							{column.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((species) => (
					<tr key={species.species_name}>
						{speciesStatsColumns.map((column) => (
							<td key={column.accessor}>
								{column.Component
									? column.Component(
											/* @ts-expect-error - TODO: fix this */
											species[column.accessor as keyof SpeciesStatsRow]
										)
									: (species[column.accessor as keyof SpeciesStatsRow] as
											| string
											| number)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default async function AllSpeciesPage() {
	return (
		<BootstrapPageData<SpeciesStatsRow[]>
			getCacheKeys={() => ['species']}
			dataFetcher={fetchSpeciesData}
			PageComponent={SpeciesStatsTable}
		/>
	);
}
