'use client';

import { type Encounter } from '@/app/session/[date]/page';

import { useState } from 'react';
export type SpeciesBreakdown = {
	species: string;
	encounters: Encounter[];
}[];

function SpeciesDetails({ encounters }: { encounters: Encounter[] | null }) {
	return (
		<table className="table table-xs ">
			<thead>
				<tr>
					<th>Time</th>
					<th>Ring No</th>
					<th>Type</th>
					<th>Age</th>
					<th>Sex</th>
					<th>Wing</th>
					<th>Weight</th>
				</tr>
			</thead>
			<tbody>
				{encounters?.map((encounter) => (
					<tr key={encounter.id}>
						<td>{encounter.capture_time}</td>
						<td>{encounter.bird.ring_no}</td>
						<td>{encounter.record_type}</td>
						<td>{encounter.age_code}</td>
						<td>{encounter.sex}</td>
						<td>{encounter.wing_length}</td>
						<td>{encounter.weight}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function SpeciesRow({
	species,
	encounters,
	onExpand,
	expandedSpecies
}: {
	species: string;
	encounters: Encounter[];
	onExpand: (species: string | null) => void;
	expandedSpecies: string | null;
}) {
	const [speciesDetail, setSpeciesDetail] = useState<Encounter[] | null>(
		expandedSpecies === species ? encounters : null
	);
	function toggleSpeciesDetail() {
		if (expandedSpecies == species) {
			onExpand(null);
			setSpeciesDetail(null);
		} else {
			onExpand(species);
			setSpeciesDetail(encounters);
		}
	}
	return (
		<>
			<tr>
				<td onClick={toggleSpeciesDetail}>{species}</td>
				<td>
					{
						encounters.filter((encounter) => encounter.record_type === 'N')
							.length
					}
				</td>
				<td>
					{
						encounters.filter((encounter) => encounter.record_type === 'S')
							.length
					}
				</td>
				<td>{encounters.filter((encounter) => encounter.minimum_years >= 1).length}</td>
				<td>{encounters.filter((encounter) => encounter.minimum_years === 0).length}</td>
			</tr>
			{expandedSpecies === species ? (
				<tr>
					<td colSpan={5}>
						<SpeciesDetails encounters={speciesDetail} />
					</td>
				</tr>
			) : (
				''
			)}
		</>
	);
}

export function SessionTable({
	date,
	speciesBreakdown
}: {
	date: string;
	speciesBreakdown: SpeciesBreakdown;
}) {
	const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);
	return (
		<div className="w-full overflow-x-auto">
			<table className="table">
				<thead>
					<tr>
						<th>Species</th>
						<th>New</th>
						<th>Retraps</th>
						<th>Adults</th>
						<th>Juvs</th>
					</tr>
				</thead>
				<tbody>
					{speciesBreakdown.map(({ species, encounters }) => (
						<SpeciesRow
							key={species}
							species={species}
							encounters={encounters}
							onExpand={setExpandedSpecies}
							expandedSpecies={expandedSpecies}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
