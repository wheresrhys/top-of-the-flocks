import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import type { Database } from '@/types/supabase.types';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import { Table } from '@/app/components/DesignSystem';
type SpeciesStatsRow = Database['public']['Views']['SpeciesStats']['Row'];
import { speciesStatsColumns } from '@/app/components/SingleSpeciesStats';

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
						<th className="text-wrap" key={column.property}>
							{column.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((species) => (
					<tr key={species.species_name}>
						{speciesStatsColumns.map((column) => (
							<td key={column.property}>
								{column.Component
									? column.Component(
											/* @ts-expect-error - TODO: fix this */
											species[column.property as keyof SpeciesStatsRow]
										)
									: (species[column.property as keyof SpeciesStatsRow] as
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
