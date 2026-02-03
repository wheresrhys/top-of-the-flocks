'use client';
import { format as formatDate } from 'date-fns';
import { type EnrichedBirdWithEncounters } from '@/app/lib/bird-data-helpers';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import Link from 'next/link';
import { Table } from './DesignSystem';
import { AccordionTableBody } from './AccordionTableBody';
import { getSex } from '@/app/lib/bird-data-helpers';

function RingNumberCell({
	model: { ring_no }
}: {
	model: EnrichedBirdWithEncounters;
}) {
	return (
		<Link className="link" href={`/bird/${ring_no}`}>
			{ring_no}
		</Link>
	);
}

function BirdDetailsTable({
	model: { encounters }
}: {
	model: EnrichedBirdWithEncounters;
}) {
	return <SingleBirdTable encounters={encounters} isInline={true} />;
}

function BirdRow({
	model: { encounters, provenAge }
}: {
	model: EnrichedBirdWithEncounters;
}) {
	return (
		<>
			<td>{encounters.length}</td>
			<td>{getSex(encounters)}</td>
			<td>
				{formatDate(new Date(encounters[0].session.visit_date), 'dd MMM yyyy')}
			</td>
			<td>
				{formatDate(
					new Date(encounters[encounters.length - 1].session.visit_date),
					'dd MMM yyyy'
				)}
			</td>
			<td>{encounters[encounters.length - 1].age_code}</td>
			<td>{provenAge}</td>
		</>
	);
}

export function SpeciesTable({
	birds
}: {
	birds: EnrichedBirdWithEncounters[];
}) {
	return (
		<Table testId="species-table">
			<thead>
				<tr>
					<th>Ring</th>
					<th>Count</th>
					<th>Sex</th>
					<th>First</th>
					<th>Last</th>
					<th>Last aged</th>
					<th>Proven age</th>
				</tr>
			</thead>
			<AccordionTableBody<EnrichedBirdWithEncounters>
				data={birds}
				getKey={(bird) => bird.ring_no}
				columnCount={5}
				FirstColumnComponent={RingNumberCell}
				RestColumnsComponent={BirdRow}
				ExpandedContentComponent={BirdDetailsTable}
			/>
		</Table>
	);
}
