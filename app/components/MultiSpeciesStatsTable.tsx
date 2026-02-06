'use client';
import { Table } from '@/app/components/DesignSystem';
import { speciesStatsColumns } from '@/app/components/SingleSpeciesStats';
import type { SpeciesStatsRow } from '@/app/isomorphic/multi-species-data';
import type { PageData } from '@/app/(routes)/species/page';
import { useState, useEffect } from 'react';
import { fetchSpeciesData } from '@/app/isomorphic/multi-species-data';
export function MultiSpeciesStatsTable({
	data: { speciesStats: initialSpeciesStats, years }
}: {
	data: PageData;
}) {
	const [year, setYear] = useState<number | null>(null);
	const [fromDate, setFromDate] = useState<string | null>(null);
	const [toDate, setToDate] = useState<string | null>(null);
	const [speciesStats, setSpeciesStats] =
		useState<SpeciesStatsRow[]>(initialSpeciesStats);
	async function setYearFromSelect(
		event: React.ChangeEvent<HTMLSelectElement>
	) {
		const year = parseInt(event.target.value);
		if (year) {
			setYear(year);
			setFromDate(`${year.toString()}-01-01`);
			setToDate(`${(year + 1).toString()}-01-01`);
		} else {
			setYear(null);
			setFromDate(null);
			setToDate(null);
		}
	}

	useEffect(() => {
		async function fetchSpeciesStats() {
			setSpeciesStats(
				await fetchSpeciesData(fromDate ?? undefined, toDate ?? undefined)
			);
		}
		fetchSpeciesStats();
	}, [fromDate, toDate]);

	// todo max encountered bird column is missing!
	return (
		<div>
			<form className="flex gap-2 items-center">
				<div className="flex items-center gap-2">
					<label htmlFor="year-select" className="shrink-0">
						Filter by year
					</label>
					<select
						id="year-select"
						className="select max-w-sm appearance-none"
						aria-label="select"
						onChange={setYearFromSelect}
						value={year ?? ''}
					>
						<option value="">All</option>
						{years.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-2">
					<label htmlFor="from-date-input" className="shrink-0">
						From date
					</label>
					<input
						id="from-date-input"
						type="date"
						className="input max-w-sm"
						onChange={(event) => setFromDate(event.target.value)}
						value={fromDate ?? ''}
					/>
					<label htmlFor="to-date-input" className="shrink-0">
						To date
					</label>
					<input
						id="to-date-input"
						type="date"
						className="input max-w-sm"
						onChange={(event) => setToDate(event.target.value)}
						value={toDate ?? ''}
					/>
				</div>
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
