'use client';
import type { EncounterOfBird } from '@/app/models/bird';
import { InlineTable } from './shared/DesignSystem';
import {
	SortableTable,
	type ColumnConfig,
	type RowModelWithRawData
} from './shared/SortableTable';

type RowModel = {
	visit_date: string;
	capture_time: string;
	age_code: string;
	sex: string;
	wing_length: number | null;
	weight: number | null;
};

function rowDataTransform(encounter: EncounterOfBird): RowModel {
	return {
		visit_date: encounter.session.visit_date,
		capture_time: encounter.capture_time,
		age_code: `${encounter.age_code}${encounter.is_juv ? 'J' : ''}`,
		sex: encounter.sex,
		wing_length: encounter.wing_length,
		weight: encounter.weight
	};
}
const columnConfigs = {
	visit_date: {
		label: 'Date'
	},
	capture_time: {
		label: 'Time'
	},
	age_code: {
		label: 'Age'
	},
	sex: {
		label: 'Sex'
	},
	wing_length: {
		label: 'Wing'
	},
	weight: {
		label: 'Weight'
	}
} as Record<keyof RowModel, ColumnConfig>;

const orderedColumnProperties = Object.keys(
	columnConfigs
) as (keyof RowModel)[];

function SingleBirdTableBody({
	data
}: {
	data: RowModelWithRawData<EncounterOfBird, RowModel>[];
}) {
	return (
		<tbody>
			{data.map((rowModel) => (
				<tr key={rowModel._rawRowData.id}>
					{orderedColumnProperties.map((property) => (
						<td key={property}>{rowModel[property]}</td>
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
						{orderedColumnProperties.map((property) => (
							<th key={property}>{columnConfigs[property].label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{encounters.map((encounter) => {
						const rowModel = rowDataTransform(encounter);
						return (
							<tr key={encounter.id}>
								{orderedColumnProperties.map((property) => (
									<td key={property}>{rowModel[property]}</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</InlineTable>
		);
	} else {
		return (
			<SortableTable<EncounterOfBird, RowModel>
				columnConfigs={columnConfigs}
				data={encounters}
				testId="single-bird-table"
				rowDataTransform={rowDataTransform}
				TableBodyComponent={SingleBirdTableBody}
			/>
		);
	}
}
