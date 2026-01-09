'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TableSortLabel
} from '@mui/material';
import { SpeciesLeagueTable } from '../../types/graphql.types';

// Define the sortable columns and their types
type SortableColumn = keyof Pick<
	SpeciesLeagueTable,
	| 'speciesName'
	| 'individuals'
	| 'encounters'
	| 'sessionCount'
	| 'longestStay'
	| 'unluckiest'
	| 'longestWinged'
	| 'averageWingLength'
	| 'shortestWinged'
	| 'heaviest'
	| 'averageWeight'
	| 'lightest'
	| 'totalWeight'
>;

type SortOrder = 'asc' | 'desc';

// Define which columns should be treated as numeric
const numericColumns: SortableColumn[] = [
	'individuals',
	'encounters',
	'sessionCount',
	'unluckiest',
	'longestWinged',
	'averageWingLength',
	'shortestWinged',
	'heaviest',
	'averageWeight',
	'lightest',
	'totalWeight'
];

// Helper function to compare values for sorting
function compareValues(
	a: SpeciesLeagueTable,
	b: SpeciesLeagueTable,
	orderBy: SortableColumn,
	order: SortOrder
) {
	// Handle null/undefined values
	if (a[orderBy] == null && b[orderBy] == null) return 0;
	if (a[orderBy] == null) return order === 'asc' ? 1 : -1;
	if (b[orderBy] == null) return order === 'asc' ? -1 : 1;

	let aValue = a[orderBy];
	let bValue = b[orderBy];

	// For numeric columns, convert strings to numbers
	if (numericColumns.includes(orderBy)) {
		aValue = typeof aValue === 'string' ? parseFloat(aValue) || 0 : aValue;
		bValue = typeof bValue === 'string' ? parseFloat(bValue) || 0 : bValue;
	}

	// For string comparisons, use localeCompare
	if (typeof aValue === 'string' && typeof bValue === 'string') {
		const result = aValue.localeCompare(bValue);
		return order === 'asc' ? result : -result;
	}

	// For numeric comparisons
	if (aValue! < bValue!) {
		return order === 'asc' ? -1 : 1;
	}
	if (aValue! > bValue!) {
		return order === 'asc' ? 1 : -1;
	}
	return 0;
}

function SortableTableCell({
	children,
	orderBy,
	order,
	onSort,
	column,
	align = 'left'
}: {
	children: React.ReactNode;
	orderBy: SortableColumn;
	order: SortOrder;
	onSort: (column: SortableColumn) => void;
	column: SortableColumn;
	align?: 'left' | 'right';
}) {
	const isActive = orderBy === column;

	return (
		<TableCell align={align}>
			<TableSortLabel
				active={isActive}
				direction={isActive ? order : 'asc'}
				onClick={() => onSort(column)}
				sx={{
					fontWeight: 'bold',
					'& .MuiTableSortLabel-root': {
						color: 'inherit'
					},
					'& .MuiTableSortLabel-root:hover': {
						color: 'primary.main'
					}
				}}
			>
				<Typography variant="h6" fontWeight="bold" component="span">
					{children}
				</Typography>
			</TableSortLabel>
		</TableCell>
	);
}

interface SortableSpeciesTableProps {
	data: SpeciesLeagueTable[];
}

export function SortableSpeciesTable({ data }: SortableSpeciesTableProps) {
	const [orderBy, setOrderBy] = useState<SortableColumn>('individuals');
	const [order, setOrder] = useState<SortOrder>('desc');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSort = (column: SortableColumn) => {
		const isAsc = orderBy === column && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(column);
	};

	// Sort the data based on current sort settings
	// Only sort after component mounts on client to avoid hydration mismatch
	const sortedSpecies = mounted
		? [...data].sort((a, b) => compareValues(a, b, orderBy, order))
		: data; // Use unsorted data during SSR

	return (
		<TableContainer component={Paper} elevation={2}>
			<Table size="small" sx={{ minWidth: 1200 }}>
				<TableHead>
					<TableRow>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="speciesName"
						>
							Species Name
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="individuals"
							align="right"
						>
							Individuals
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="encounters"
							align="right"
						>
							Encounters
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="sessionCount"
							align="right"
						>
							Session Count
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="longestStay"
							align="right"
						>
							Longest Stay
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="unluckiest"
							align="right"
						>
							Unluckiest
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="longestWinged"
							align="right"
						>
							Max Wing
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="averageWingLength"
							align="right"
						>
							Avg Wing
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="shortestWinged"
							align="right"
						>
							Min Wing
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="heaviest"
							align="right"
						>
							Max Weight
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="averageWeight"
							align="right"
						>
							Avg Weight
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="lightest"
							align="right"
						>
							Min Weight
						</SortableTableCell>
						<SortableTableCell
							orderBy={orderBy}
							order={order}
							onSort={handleSort}
							column="totalWeight"
							align="right"
						>
							Total Weight
						</SortableTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{sortedSpecies.map((species, index) => (
						<TableRow
							key={species.speciesName || index}
							sx={{
								'&:nth-of-type(odd)': {
									backgroundColor: 'action.hover'
								}
							}}
						>
							<TableCell component="th" scope="row">
								<Link
									href={`/species/${encodeURIComponent(species.speciesName || '')}`}
									style={{ textDecoration: 'none' }}
								>
									<Typography
										variant="body1"
										sx={{
											color: 'primary.main',
											'&:hover': {
												textDecoration: 'underline'
											}
										}}
									>
										{species.speciesName}
									</Typography>
								</Link>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.individuals?.toLocaleString() || 0}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.encounters?.toLocaleString() || 0}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.sessionCount?.toLocaleString() || 0}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.longestStay || '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.unluckiest || '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.longestWinged ? `${species.longestWinged}mm` : '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.averageWingLength
										? `${Number(species.averageWingLength).toFixed(1)}mm`
										: '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.shortestWinged ? `${species.shortestWinged}mm` : '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.heaviest ? `${species.heaviest}g` : '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.averageWeight
										? `${species.averageWeight.toFixed(1)}g`
										: '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.lightest ? `${species.lightest}g` : '-'}
								</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body2">
									{species.totalWeight ? `${species.totalWeight}g` : '-'}
								</Typography>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
