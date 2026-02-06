'use client';
import { format as formatDate } from 'date-fns';
import { type EnrichedBirdOfSpecies } from '@/app/models/bird';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import Link from 'next/link';
import { Table } from './DesignSystem';
import { AccordionTableBody } from './AccordionTableBody';

function RingNumberCell({
	model: { ring_no }
}: {
	model: EnrichedBirdOfSpecies;
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
	model: EnrichedBirdOfSpecies;
}) {
	return <SingleBirdTable encounters={encounters} isInline={true} />;
}

function BirdRow({ model: bird }: { model: EnrichedBirdOfSpecies }) {
	return (
		<>
			<td>{bird.encounters.length}</td>
			<td>
				{bird.sex}
				{bird.sexCertainty < 0.5 ? `?` : ''}
			</td>
			<td>{formatDate(bird.firstEncounterDate, 'dd MMM yyyy')}</td>
			<td>{formatDate(bird.lastEncounterDate, 'dd MMM yyyy')}</td>
			<td>
				{bird.lastEncounter.age_code}
				{bird.lastEncounter.is_juv ? 'J' : ''}
			</td>
			<td>{bird.provenAge}</td>
		</>
	);
}

export function SpeciesTable({ birds }: { birds: EnrichedBirdOfSpecies[] }) {
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
			<AccordionTableBody<EnrichedBirdOfSpecies>
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
