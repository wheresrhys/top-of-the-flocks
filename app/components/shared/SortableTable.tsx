'use client';
import { Table } from '@/app/components/shared/DesignSystem';
import { useState } from 'react';

export type ColumnConfig<RowModel> = {
	label: string;
	property: keyof RowModel;
	invertSort?: boolean;
	accessor?: (row: RowModel) => string;
};

type SortableTableProps<RowModel> = {
	columnConfigs: ColumnConfig<RowModel>[];
	data: RowModel[];
	testId?: string;
	initialSortColumn?: keyof RowModel;
	TableBodyComponent: React.ComponentType<{ data: RowModel[] }>;
};

export function SortableBodyCell<RowModel>({
	columnConfig,
	data
}: {
	columnConfig: ColumnConfig<RowModel>;
	data: RowModel;
}) {
	return (
		<td>
			{columnConfig.accessor
				? columnConfig.accessor(data)
				: (data[columnConfig.property] as string | number | boolean)}
		</td>
	);
}

export function SortableTable<RowModel>({
	columnConfigs,
	data,
	initialSortColumn,
	testId,
	TableBodyComponent
}: SortableTableProps<RowModel>) {
	const columnConfigMap = columnConfigs.reduce(
		(acc, columnConfig) => {
			acc[columnConfig.property] = columnConfig;
			return acc;
		},
		{} as Record<keyof RowModel, ColumnConfig<RowModel>>
	);
	const [sortColumn, setSortColumn] = useState<keyof RowModel | null>(
		initialSortColumn || null
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
		null
	);
	const [sortIsInverted, setSortIsInverted] = useState<boolean>(
		initialSortColumn
			? columnConfigMap[initialSortColumn].invertSort || false
			: false
	);

	function handleColumnClick(property: keyof RowModel) {
		if (sortColumn === property) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(property);
			// TODO hideously inefficient
			setSortIsInverted(columnConfigMap[property].invertSort || false);
			setSortDirection('desc');
		}
	}

	let sortedData = data;
	if (sortColumn) {
		const sortColumnConfig = columnConfigMap[sortColumn as keyof RowModel];
		const accessor =
			sortColumnConfig.accessor ||
			((row: RowModel) => row[sortColumn as keyof RowModel]);

		sortedData = data.sort((a, b) => {
			const aValue = accessor(a);
			const bValue = accessor(b);
			let comparisonResult = 0;
			if (typeof aValue === 'string') {
				comparisonResult = aValue.localeCompare(bValue as string);
			} else {
				if (aValue == bValue) {
					comparisonResult = 0;
				} else {
					comparisonResult = (aValue as number) > (bValue as number) ? 1 : -1;
				}
			}
			return (
				comparisonResult *
				(sortDirection === 'asc' ? 1 : -1) *
				(sortIsInverted ? -1 : 1)
			);
		});
	}

	return (
		<Table testId={testId}>
			<thead>
				<tr>
					{columnConfigs.map((column) => (
						<th
							className="text-wrap cursor-pointer"
							key={column.property as string}
							onClick={() => handleColumnClick(column.property)}
						>
							<div className="flex items-center justify-between gap-1">
								{column.label}
								{sortColumn === column.property ? (
									<span
										className={`icon-[tabler--chevron-${sortDirection === 'asc' ? 'up' : 'down'}] size-4`}
									></span>
								) : null}
							</div>
						</th>
					))}
				</tr>
			</thead>
			<TableBodyComponent data={sortedData} />
		</Table>
	);
}
