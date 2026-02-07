'use client';

import { type SessionEncounter } from '@/app/models/session';
import Link from 'next/link';
import { InlineTable } from './shared/DesignSystem';
import { AccordionTableBody } from './shared/AccordionTableBody';
export type SpeciesBreakdown = {
	species: string;
	encounters: SessionEncounter[];
};
import {
	type ColumnConfig,
	SortableBodyCell,
	SortableTable
} from './shared/SortableTable';

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
				{encounters.map((encounter) => (
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

const columnConfigs = [
	{ label: 'Species', property: 'species' },
	{
		label: 'New',
		property: 'new',
		accessor: (row: SpeciesBreakdown) =>
			row.encounters.filter((encounter) => encounter.record_type === 'N').length
	},
	{
		label: 'Retraps',
		property: 'retraps',
		accessor: (row: SpeciesBreakdown) =>
			row.encounters.filter((encounter) => encounter.record_type === 'S').length
	},
	{
		label: 'Adults',
		property: 'adults',
		accessor: (row: SpeciesBreakdown) =>
			row.encounters.filter((encounter) => encounter.minimum_years >= 1).length
	},
	{
		label: 'Juvs',
		property: 'juvs',
		accessor: (row: SpeciesBreakdown) =>
			row.encounters.filter((encounter) => encounter.minimum_years === 0).length
	}
] as ColumnConfig<SpeciesBreakdown>[];

function SpeciesRow({ model }: { model: SpeciesBreakdown }) {
	return columnConfigs
		.slice(1)
		.map((column) => (
			<SortableBodyCell
				key={column.property}
				columnConfig={column}
				data={model}
			/>
		));
}

function SessionTableBody({ data }: { data: SpeciesBreakdown[] }) {
	return (
		<AccordionTableBody<SpeciesBreakdown>
			data={data}
			getKey={(speciesBreakdown) => speciesBreakdown.species}
			columnCount={5}
			FirstColumnComponent={SpeciesNameCell}
			RestColumnsComponent={SpeciesRow}
			ExpandedContentComponent={SpeciesDetailsTable}
		/>
	);
}

export function SessionTable({
	speciesBreakdown
}: {
	speciesBreakdown: SpeciesBreakdown[];
}) {
	return (
		<SortableTable<SpeciesBreakdown>
			columnConfigs={columnConfigs}
			data={speciesBreakdown}
			TableBodyComponent={SessionTableBody}
		/>
	);
}
