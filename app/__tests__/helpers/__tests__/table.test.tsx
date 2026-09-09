import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { getColumnIndex, getRowByText, getCellByHeading } from '../table';

afterEach(cleanup);

function renderTable() {
	render(
		<table>
			<thead>
				<tr>
					<th>Species</th>
					<th>New</th>
					<th>Retraps</th>
				</tr>
				<tr data-testid="totals-row">
					<td>Total</td>
					<td>12</td>
					<td>4</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Robin</td>
					<td>5</td>
					<td>1</td>
				</tr>
				<tr>
					<td>Wren</td>
					<td>7</td>
					<td>3</td>
				</tr>
			</tbody>
		</table>
	);
	return screen.getByRole('table');
}

describe('getColumnIndex', () => {
	it('returns the 0-based index of the matching column heading', () => {
		const table = renderTable();
		expect(getColumnIndex(table, 'Species')).toBe(0);
		expect(getColumnIndex(table, 'Retraps')).toBe(2);
	});

	it('throws when the heading does not exist', () => {
		const table = renderTable();
		expect(() => getColumnIndex(table, 'Unknown')).toThrow(
			'Column heading "Unknown" not found in table'
		);
	});
});

describe('getRowByText', () => {
	it('returns the row whose text content includes rowText', () => {
		const table = renderTable();
		const row = getRowByText(table, 'Wren');
		expect(row.textContent).toContain('Wren');
		expect(row.textContent).toContain('7');
	});

	it('throws when no row matches', () => {
		const table = renderTable();
		expect(() => getRowByText(table, 'Heron')).toThrow(
			'Row containing "Heron" not found in table'
		);
	});
});

describe('getCellByHeading', () => {
	describe('row identified by text', () => {
		it('returns the cell under the heading in the matching row', () => {
			const table = renderTable();
			const cell = getCellByHeading(table, 'New', 'Wren');
			expect(cell.textContent).toBe('7');
		});
	});

	describe('row identified by index', () => {
		it('returns the cell in the nth data row, ignoring header/totals rows', () => {
			const table = renderTable();
			expect(getCellByHeading(table, 'New', 0).textContent).toBe('5');
			expect(getCellByHeading(table, 'New', 1).textContent).toBe('7');
		});

		it('throws when the row index is out of range', () => {
			const table = renderTable();
			expect(() => getCellByHeading(table, 'New', 5)).toThrow(
				'Row index 5 out of range — table has 2 data row(s)'
			);
		});
	});

	describe('row identified by element', () => {
		it('returns the cell within the given row element, e.g. a totals row', () => {
			const table = renderTable();
			const totalsRow = screen.getByTestId('totals-row');
			expect(getCellByHeading(table, 'New', totalsRow).textContent).toBe('12');
		});
	});

	it('throws when the heading does not exist', () => {
		const table = renderTable();
		expect(() => getCellByHeading(table, 'Unknown', 0)).toThrow(
			'Column heading "Unknown" not found in table'
		);
	});
});

describe('omitted container', () => {
	it('defaults to the sole table in the document for getColumnIndex/getRowByText/getCellByHeading', () => {
		renderTable();
		expect(getColumnIndex('Species')).toBe(0);
		expect(getRowByText('Wren').textContent).toContain('Wren');
		expect(getCellByHeading('New', 'Wren').textContent).toBe('7');
	});
});
