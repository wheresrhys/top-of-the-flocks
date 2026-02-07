'use client';
import { format as formatDate } from 'date-fns';
import { type EnrichedBirdOfSpecies } from '@/app/models/bird';
import { SingleBirdTable } from '@/app/components/SingleBirdTable';
import Link from 'next/link';
import { AccordionTableBody } from './shared/AccordionTableBody';
import {
	SortableTable,
	type ColumnConfig,
	type RowModelWithRawData
} from './shared/SortableTable';

type RowModel = {
	ringNo: string;
	encounterCount: number;
	sex: string;
	firstEncounterDate: string;
	lastEncounterDate: string;
	lastEncounterAgeCode: string;
	provenAge: number;
};

const columnConfigs = {
	ringNo: {
		label: 'Ring',
		invertSort: true
	},
	encounterCount: {
		label: 'Count'
	},
	sex: {
		label: 'Sex'
	},
	firstEncounterDate: {
		label: 'First'
	},
	lastEncounterDate: {
		label: 'Last'
	},
	lastEncounterAgeCode: {
		label: 'Last aged'
	},
	provenAge: {
		label: 'Proven age'
	}
} as Record<keyof RowModel, ColumnConfig>;

const orderedColumnProperties = Object.keys(
	columnConfigs
) as (keyof RowModel)[];

function RingNumberCell({ model: { ringNo } }: { model: RowModel }) {
	return (
		<Link className="link" href={`/bird/${ringNo}`}>
			{ringNo}
		</Link>
	);
}

function BirdDetailsTable({
	model: {
		_rawRowData: { encounters }
	}
}: {
	model: RowModelWithRawData<EnrichedBirdOfSpecies, RowModel>;
}) {
	return <SingleBirdTable encounters={encounters} isInline={true} />;
}

function BirdRow({ model: bird }: { model: RowModel }) {
	return orderedColumnProperties
		.slice(1)
		.map((prop) => <td key={prop}>{bird[prop]}</td>);
}

function rowDataTransform(bird: EnrichedBirdOfSpecies): RowModel {
	return {
		ringNo: bird.ring_no,
		encounterCount: bird.encounters.length,
		sex: `${bird.sex}${bird.sexCertainty < 0.5 ? '?' : ''}`,
		firstEncounterDate: formatDate(bird.firstEncounterDate, 'dd MMM yyyy'),
		lastEncounterDate: formatDate(bird.lastEncounterDate, 'dd MMM yyyy'),
		lastEncounterAgeCode: `${bird.lastEncounter.age_code}${bird.lastEncounter.is_juv ? 'J' : ''}`,
		provenAge: bird.provenAge
	};
}

export function SpeciesTable({ birds }: { birds: EnrichedBirdOfSpecies[] }) {
	return (
		<SortableTable<EnrichedBirdOfSpecies, RowModel>
			columnConfigs={columnConfigs}
			data={birds}
			testId="species-table"
			rowDataTransform={rowDataTransform}
			TableBodyComponent={({ data }) => (
				<AccordionTableBody<
					RowModelWithRawData<EnrichedBirdOfSpecies, RowModel>
				>
					data={data}
					getKey={(bird) => bird.ringNo}
					columnCount={Object.keys(columnConfigs).length}
					FirstColumnComponent={RingNumberCell}
					RestColumnsComponent={BirdRow}
					ExpandedContentComponent={BirdDetailsTable}
				/>
			)}
		/>
	);
}
