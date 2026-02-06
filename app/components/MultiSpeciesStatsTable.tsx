import { Table } from '@/app/components/DesignSystem';
import { speciesStatsColumns } from '@/app/components/SingleSpeciesStats';
import type { SpeciesStatsRow } from '@/app/isomorphic/multi-species-data';

/* <select class="select max-w-sm appearance-none" aria-label="select">
  <option disabled selected>Pick your favorite Movie</option>
  <option>The Godfather</option>
  <option>The Shawshank Redemption</option>
  <option>Pulp Fiction</option>
  <option>The Dark Knight</option>
  <option>Schindler's List</option>
</select> */

export function MultiSpeciesStatsTable({ data }: { data: SpeciesStatsRow[] }) {
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
