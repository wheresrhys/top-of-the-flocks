'use client';
import type { EncounterOfBird } from '@/app/models/bird';
import { InlineTable } from './shared/DesignSystem';
import {
	SortableTable,
	SortableBodyCell,
	type ColumnConfig
} from './shared/SortableTable';

const columnConfigs = [
	{
		label: 'Date',
		property: 'visit_date',
		accessor: (row: EncounterOfBird) => row.session.visit_date
	},
	{
		label: 'Time',
		property: 'capture_time'
	},
	{
		label: 'Age',
		property: 'age_code'
	},
	{
		label: 'Sex',
		property: 'sex'
	},
	{
		label: 'Wing',
		property: 'wing_length'
	},
	{
		label: 'Weight',
		property: 'weight'
	}
] as ColumnConfig<EncounterOfBird>[];

function SingleBirdTableBody({ data }: { data: EncounterOfBird[] }) {
	return (
		<tbody>
			{data.map((encounter) => (
				<tr key={encounter.id}>
					{columnConfigs.map((column) => (
						<SortableBodyCell
							key={column.property}
							columnConfig={column}
							data={encounter}
						/>
					))}
				</tr>
			))}
		</tbody>
	);
}

export function SingleBirdTable({
	encounters,
	isInline = false
}: {
	encounters: EncounterOfBird[];
	isInline?: boolean;
}) {
	if (isInline) {
		return (
			<InlineTable testId="single-bird-table">
				<thead>
					<tr>
						{columnConfigs.map((column) => (
							<th key={column.property}>{column.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{encounters.map((encounter) => (
						<tr key={encounter.id}>
							{columnConfigs.map((column) => (
								<td key={column.property}>
									{column.accessor
										? column.accessor(encounter)
										: (encounter[column.property] as string | number | boolean)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</InlineTable>
		);
	} else {
		return (
			<SortableTable<EncounterOfBird>
				columnConfigs={columnConfigs}
				data={encounters}
				testId="single-bird-table"
				TableBodyComponent={SingleBirdTableBody}
			/>
		);
	}
}
