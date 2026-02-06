import { getAllByRole } from '@testing-library/react';
import { expect } from 'vitest';
export function verifyTableData(
	table: HTMLElement,
	data: string[][],
	{ isPartial = true }: { isPartial?: boolean } = { isPartial: true }
) {
	const [thead, tbody] = getAllByRole(table, 'rowgroup');
	const headers = getAllByRole(thead, 'columnheader');
	expect(headers).toHaveLength(data[0].length);
	data[0].map((header, index) => {
		expect(headers[index].textContent.trim()).toBe(header);
	});
	const rowEls = getAllByRole(tbody, 'row');
	if (isPartial) {
		expect(rowEls.length).toBeGreaterThanOrEqual(data.length - 1);
	} else {
		expect(rowEls).toHaveLength(data.length - 1);
	}
	data.slice(1).map((row, index) => {
		const rowEl = rowEls[index];
		const cells = getAllByRole(rowEl, 'cell');
		expect(cells).toHaveLength(row.length);
		row.map((cell, index) => {
			expect(cells[index].textContent.trim()).toBe(String(cell));
		});
	});
}
