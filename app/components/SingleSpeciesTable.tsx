'use client';
import { format as formatDate } from 'date-fns';
import { type EnrichedBirdOfSpecies } from '@/app/models/bird';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import Link from 'next/link';
import { AccordionTableBody } from './shared/AccordionTableBody';
import { SortableTable, type ColumnConfig } from './shared/SortableTable';
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

const columnConfigs = [
	{
		label: 'Ring',
		property: 'ring_no'
	},
	{
		label: 'Count',
		property: 'encounters.length',
		accessor: (row: EnrichedBirdOfSpecies) => row.encounters.length
	},
	{
		label: 'Sex',
		property: 'sex',
		accessor: (row: EnrichedBirdOfSpecies) => row.sex
	},
	{
		label: 'First',
		property: 'firstEncounterDate',
		accessor: (row: EnrichedBirdOfSpecies) =>
			formatDate(row.firstEncounterDate, 'dd MMM yyyy')
	},
	{
		label: 'Last',
		property: 'lastEncounterDate',
		accessor: (row: EnrichedBirdOfSpecies) =>
			formatDate(row.lastEncounterDate, 'dd MMM yyyy')
	},
	{
		label: 'Last aged',
		property: 'lastEncounter.age_code',
		accessor: (row: EnrichedBirdOfSpecies) => row.lastEncounter.age_code
	},
	{
		label: 'Proven age',
		property: 'provenAge'
	}
] as ColumnConfig<EnrichedBirdOfSpecies>[];

export function SpeciesTable({ birds }: { birds: EnrichedBirdOfSpecies[] }) {
	return (
		<SortableTable<EnrichedBirdOfSpecies>
			columnConfigs={columnConfigs}
			data={birds}
			testId="species-table"
			TableBodyComponent={({ data }) => (
				<AccordionTableBody<EnrichedBirdOfSpecies>
					data={data}
					getKey={(bird) => bird.ring_no}
					columnCount={columnConfigs.length}
					FirstColumnComponent={RingNumberCell}
					RestColumnsComponent={BirdRow}
					ExpandedContentComponent={BirdDetailsTable}
				/>
			)}
		/>
	);
}
