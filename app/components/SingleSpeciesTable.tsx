'use client';
import { useState } from 'react';
import formatDate from 'intl-dateformat';
import {
	type EnrichedBirdWithEncounters,
	Encounter
} from '@/app/species/[speciesName]/page';

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

function BirdRow({
	ring_no,
	encounters,
	onExpand,
	expandedBird,
	provenAge
}: {
	ring_no: string;
	encounters: Encounter[];
	provenAge: number;
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
				<td>
					{formatDate(
						new Date(encounters[0].session.visit_date),
						'DD MMMM YYYY'
					)}
				</td>
				<td>
					{formatDate(
						new Date(encounters[encounters.length - 1].session.visit_date),
						'DD MMMM YYYY'
					)}
				</td>
				<td>{provenAge}</td>
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

export function SpeciesTable({
	birds
}: {
	birds: EnrichedBirdWithEncounters[];
}) {
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
						<th>Proven age</th>
					</tr>
				</thead>
				<tbody>
					{birds.map(({ ring_no, encounters, provenAge }) => (
						<BirdRow
							key={ring_no}
							ring_no={ring_no}
							provenAge={provenAge}
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
