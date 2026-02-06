'use client';
import { PageWrapper, Table } from '@/app/components/shared/DesignSystem';
import { speciesStatsColumns } from '@/app/models/species-stats';
import type { SpeciesStatsRow } from '@/app/models/db';
import type { PageData } from '@/app/(routes)/species/page';
import { useState, useEffect, useRef } from 'react';
import { fetchSpeciesData } from '@/app/isomorphic/multi-species-data';
export function MultiSpeciesStatsTable({
	data: { speciesStats: initialSpeciesStats, years }
}: {
	data: PageData;
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [year, setYear] = useState<number | null>(null);
	const [cesOnly, setCesOnly] = useState<boolean>(false);
	const [fromDate, setFromDate] = useState<string | null>(null);
	const [toDate, setToDate] = useState<string | null>(null);
	const [sortColumn, setSortColumn] = useState<keyof SpeciesStatsRow | null>(
		null
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
		null
	);
	const [sortIsInverted, setSortIsInverted] = useState<boolean>(false);
	const [speciesStats, setSpeciesStats] =
		useState<SpeciesStatsRow[]>(initialSpeciesStats);
	useEffect(() => {
		fetchSpeciesData(fromDate ?? undefined, toDate ?? undefined).then(
			setSpeciesStats
		);
	}, [fromDate, toDate]);

	function clearSettings() {
		setYear(null);
		setCesOnly(false);
	}

	function clearDates() {
		setFromDate(null);
		setToDate(null);
	}

	function setDatesFromSettings({
		year,
		cesOnly
	}: {
		year: number | null;
		cesOnly: boolean;
	}) {
		if (year) {
			setFromDate(`${year.toString()}-${cesOnly ? '04-25' : '01-01'}`);
			setToDate(`${year.toString()}-${cesOnly ? '09-05' : '12-31'}`);
		} else {
			clearDates();
		}
	}

	function handleYearSelect(event: React.ChangeEvent<HTMLSelectElement>) {
		const year = parseInt(event.target.value) || null;
		setYear(year);
		setDatesFromSettings({ year, cesOnly });
	}

	function handleCesOnlyChange(event: React.ChangeEvent<HTMLInputElement>) {
		const cesOnly = event.target.checked;
		setCesOnly(cesOnly);
		setDatesFromSettings({ year, cesOnly });
	}

	function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		const inputType = event.target.id.split('-')[0];
		clearSettings();
		if (inputType === 'from') {
			setFromDate(value);
		} else {
			setToDate(value);
		}
	}

	function handleColumnClick(property: string) {
		if (sortColumn === property) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(property as keyof SpeciesStatsRow);
			// TODO hideously inefficient
			setSortIsInverted(
				speciesStatsColumns.find((col) => col.property === property)
					?.invertSort || false
			);
			setSortDirection('desc');
		}
	}

	const sortedSpeciesStats = speciesStats.sort((a, b) => {
		const aValue = a[sortColumn as keyof SpeciesStatsRow];
		const bValue = b[sortColumn as keyof SpeciesStatsRow];
		let comparisonResult = 0;
		if (typeof aValue === 'string') {
			comparisonResult = aValue.localeCompare(bValue as string);
		} else {
			if (aValue == bValue) {
				comparisonResult = 0;
			} else {
				comparisonResult = (aValue as number) > (bValue as number) ? 1 : -1;
			}
		}
		return (
			comparisonResult *
			(sortDirection === 'asc' ? 1 : -1) *
			(sortIsInverted ? -1 : 1)
		);
	});

	return (
		<>
			<PageWrapper>
				<form ref={formRef} className="flex gap-2 flex-wrap justify-end">
					<div className="flex gap-2">
						<div className="flex items-center gap-2">
							<label htmlFor="year-select" className="shrink-0">
								Year
							</label>
							<select
								id="year-select"
								className="select max-w-sm appearance-none"
								aria-label="select"
								onChange={handleYearSelect}
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
							<label
								htmlFor="ces-only-checkbox"
								className={`shrink-0 ${!year ? 'text-gray-400' : ''}`}
							>
								CES only
							</label>
							<input
								id="ces-only-checkbox"
								type="checkbox"
								className="checkbox"
								onChange={handleCesOnlyChange}
								checked={cesOnly}
								disabled={!year}
							/>
						</div>
					</div>
					<div className="flex gap-2 flex-wrap justify-end">
						<div className="flex items-center gap-2">
							<label htmlFor="from-date-input" className="shrink-0">
								From date
							</label>
							<input
								id="from-date-input"
								type="date"
								className="input max-w-sm"
								onChange={handleDateChange}
								value={fromDate ?? ''}
							/>
						</div>
						<div className="flex items-center gap-2">
							<label htmlFor="to-date-input" className="shrink-0">
								To date
							</label>
							<input
								id="to-date-input"
								type="date"
								className="input max-w-sm"
								onChange={handleDateChange}
								value={toDate ?? ''}
							/>
						</div>
					</div>
				</form>
			</PageWrapper>
			<Table>
				<thead>
					<tr>
						{speciesStatsColumns.map((column) => (
							<th
								className="text-wrap"
								key={column.property}
								onClick={() => handleColumnClick(column.property)}
							>
								<div className="flex items-center justify-between gap-1">
									{column.label}
									{sortColumn === column.property ? (
										<span
											className={`icon-[tabler--chevron-${sortDirection === 'asc' ? 'up' : 'down'}] size-4`}
										></span>
									) : null}
								</div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sortedSpeciesStats.map((species) => (
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
		</>
	);
}
