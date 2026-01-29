'use client';

import {
	type BirdWithEncounters,
	Encounter
} from '@/app/species/[speciesName]/page';

import { useState } from 'react';

function BirdDetail({ encounters }: { encounters: Encounter[] }) {
	return (
		<table className="table table-xs ">
			<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
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
						<td>{encounter.session.visit_date}</td>
						<td>{encounter.capture_time}</td>
						<td>{encounter.record_type}</td>
						<td>{encounter.age}</td>
						<td>{encounter.sex}</td>
						<td>{encounter.wing_length}</td>
						<td>{encounter.weight}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function BirdRow({
	ring_no,
	encounters,
	onExpand,
	expandedBird
}: {
	ring_no: string;
	encounters: Encounter[];
	onExpand: (ring_no: string | null) => void;
	expandedBird: string | null;
}) {
	const [birdDetail, setBirdDetail] = useState<Encounter[]>(
		expandedBird === ring_no ? encounters : []
	);
	function toggleBirdDetail() {
		if (expandedBird === ring_no) {
			onExpand(null);
			setBirdDetail([]);
		} else {
			onExpand(ring_no);
			setBirdDetail(encounters);
		}
	}
	return (
		<>
			<tr>
				<td onClick={toggleBirdDetail}>{ring_no}</td>
				<td>{encounters.length}</td>
				<td>TD</td>
				<td>TD</td>
			</tr>
			{expandedBird === ring_no ? (
				<tr>
					<td colSpan={5}>
						<BirdDetail encounters={birdDetail} />
					</td>
				</tr>
			) : (
				''
			)}
		</>
	);
}

export function SpeciesTable({ birds }: { birds: BirdWithEncounters[] }) {
	const [expandedBird, setExpandedBird] = useState<string | null>(null);
	return (
		<div className="w-full overflow-x-auto">
			<table className="table">
				<thead>
					<tr>
						<th>Ring</th>
						<th>Encounters</th>
						<th>First record</th>
						<th>Last record</th>
					</tr>
				</thead>
				<tbody>
					{birds.map(({ ring_no, encounters }) => (
						<BirdRow
							key={ring_no}
							ring_no={ring_no}
							encounters={encounters}
							onExpand={setExpandedBird}
							expandedBird={expandedBird}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
