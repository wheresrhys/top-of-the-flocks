'use client';
import { Table } from '@/app/components/DesignSystem';
import { speciesStatsColumns } from '@/app/components/SingleSpeciesStats';
import type { SpeciesStatsRow } from '@/app/isomorphic/multi-species-data';
import type { PageData } from '@/app/(routes)/species/page';
import { useState } from 'react';
import { fetchSpeciesData } from '@/app/isomorphic/multi-species-data';
export function MultiSpeciesStatsTable({
	data: { speciesStats: initialSpeciesStats, years }
}: {
	data: PageData;
}) {
	const [year, setYear] = useState<number | null>(null);
	const [speciesStats, setSpeciesStats] =
		useState<SpeciesStatsRow[]>(initialSpeciesStats);
	async function filterByYear(event: React.ChangeEvent<HTMLSelectElement>) {
		const year = parseInt(event.target.value);
		setYear(year);
		if (year) {
			setSpeciesStats(
				await fetchSpeciesData(
					`${year.toString()}-01-01`,
					`${(year + 1).toString()}-01-01`
				)
			);
		} else {
			setSpeciesStats(await fetchSpeciesData());
		}
	}

	// todo max encountered bird column is missing!
	return (
		<div>
			<form>
				<label htmlFor="year-select">Filter by year</label>
				<select
					id="year-select"
					className="select max-w-sm appearance-none"
					aria-label="select"
					value={year ?? ''}
					onChange={filterByYear}
				>
					<option selected value="">
						All
					</option>
					{years.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</form>
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
					{speciesStats.map((species) => (
						<tr key={species.species_name}>
							{speciesStatsColumns.map((column) => (
								<td key={column.property}>
									{column.Component
										? column.Component(
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
		</div>
	);
}
