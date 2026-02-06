'use client';
import { Table } from '@/app/components/shared/DesignSystem';
import { useState } from 'react';

export type ColumnConfig<RowModel> = {
	label: string;
	property: keyof RowModel;
	invertSort?: boolean;
	accessor?: (row: RowModel) => string;
};

export function SortableTable<RowModel>({
	columnConfigs,
	data,
	initialSortColumn,
	RowComponent,
	getRowKey,
	testId,
	columnComponents = {} as Record<
		keyof RowModel,
		React.ComponentType<{ data: RowModel }>
	>
}: {
	columnConfigs: ColumnConfig<RowModel>[];
	data: RowModel[];
	testId?: string;
	initialSortColumn?: keyof RowModel;
	RowComponent?: React.ComponentType<{ data: RowModel }>;
	columnComponents?: Partial<
		Record<keyof RowModel, React.ComponentType<{ data: RowModel }>>
	>;
	getRowKey: (row: RowModel) => string;
}) {
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

	const sortedData = data.sort((a, b) => {
		const aValue = a[sortColumn as keyof RowModel];
		const bValue = b[sortColumn as keyof RowModel];
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
			<tbody>
				{sortedData.map((row) => {
					const rowKey = getRowKey(row);
					if (RowComponent) {
						return <RowComponent key={rowKey} data={row} />;
					} else {
						return (
							<tr key={rowKey}>
								{columnConfigs.map((column) => {
									const Component = columnComponents[column.property] as
										| React.ComponentType<{ data: RowModel }>
										| undefined;
									return (
										<td key={column.property as string}>
											{Component ? (
												<Component data={row} />
											) : column.accessor ? (
												column.accessor(row)
											) : (
												(row[column.property] as string | number | boolean)
											)}
										</td>
									);
								})}
							</tr>
						);
					}
				})}
			</tbody>
		</Table>
	);
}
