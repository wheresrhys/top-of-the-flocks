'use client';

import { type Encounter } from '@/app/(routes)/session/[date]/page';
import Link from 'next/link';
import { InlineTable, Table } from './DesignSystem';
import { AccordionTableBody } from './AccordionTableBody';
export type SpeciesBreakdown = {
	species: string;
	encounters: Encounter[];
};

function SpeciesNameCell({ model: { species } }: { model: SpeciesBreakdown }) {
	return (
		<Link className="link text-wrap" href={`/species/${species}`}>
			{species}
		</Link>
	);
}

function SpeciesDetailsTable({
	model: { encounters }
}: {
	model: SpeciesBreakdown;
}) {
	return (
		<InlineTable>
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
						<td>
							<Link className="link" href={`/bird/${encounter.bird.ring_no}`}>
								{encounter.bird.ring_no}
							</Link>
						</td>
						<td>{encounter.record_type}</td>
						<td>{encounter.age_code}</td>
						<td>{encounter.sex}</td>
						<td>{encounter.wing_length}</td>
						<td>{encounter.weight}</td>
					</tr>
				))}
			</tbody>
		</InlineTable>
	);
}

function SpeciesRow({ model: { encounters } }: { model: SpeciesBreakdown }) {
	return (
		<>
			<td>
				{encounters.filter((encounter) => encounter.record_type === 'N').length}
			</td>
			<td>
				{encounters.filter((encounter) => encounter.record_type === 'S').length}
			</td>
			<td>
				{encounters.filter((encounter) => encounter.minimum_years >= 1).length}
			</td>
			<td>
				{encounters.filter((encounter) => encounter.minimum_years === 0).length}
			</td>
		</>
	);
}

export function SessionTable({
	speciesBreakdown
}: {
	speciesBreakdown: SpeciesBreakdown[];
}) {
	return (
		<Table testId="session-table">
			<thead>
				<tr>
					<th>Species</th>
					<th>New</th>
					<th>Retraps</th>
					<th>Adults</th>
					<th>Juvs</th>
				</tr>
			</thead>
			<AccordionTableBody<SpeciesBreakdown>
				data={speciesBreakdown}
				getKey={(speciesBreakdown) => speciesBreakdown.species}
				columnCount={5}
				FirstColumnComponent={SpeciesNameCell}
				RestColumnsComponent={SpeciesRow}
				ExpandedContentComponent={SpeciesDetailsTable}
			/>
		</Table>
	);
}
