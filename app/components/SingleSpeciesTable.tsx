'use client';
import { useState } from 'react';
import formatDate from 'intl-dateformat';
import {
	type EnrichedBirdWithEncounters,
	Encounter
} from '@/app/bird/[ring]/page';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';

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
						<SingleBirdTable encounters={birdDetail} />
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
