import { expect, describe, it } from 'vitest';
import {
	render,
	screen,
	getByRole,
	getAllByRole,
	fireEvent,
	findAllByRole,
	waitFor
} from '@testing-library/react';
import { verifyTableData } from './helpers/verify-table-data';
import Page from '../species/[speciesName]/page';

describe('species page', () => {
	it('should show correct heading', async () => {
		render(
			await Page({
				params: new Promise((resolve) =>
					resolve({ speciesName: "Cetti's Warbler" })
				)
			})
		);
		const heading = await screen.findByRole('heading', {
			level: 1
		});
		expect(heading.textContent).toBe("Cetti's Warbler");
	});
	it('should show headline stats', async () => {
		render(
			await Page({
				params: new Promise((resolve) =>
					resolve({ speciesName: "Cetti's Warbler" })
				)
			})
		);
		const headlineStats = await screen.findByTestId('headline-stats');
		const statsLineItems = getAllByRole(headlineStats, 'listitem');

		expect(statsLineItems).toHaveLength(6);
		expect(statsLineItems[0].textContent).toBe(
			'6 individuals, 15 encounters, caught at 6 sessions'
		);
		expect(statsLineItems[1].textContent).toBe('Wing: 55 - 65 (avg 59.9)');
		expect(statsLineItems[2].textContent).toBe(
			'Weight: 11.1 - 15.1 (avg 13.0)'
		);
		expect(statsLineItems[3].textContent).toBe('No notably old birds');
		expect(statsLineItems[4].textContent).toBe(
			'Most caught birds: 3 encounters each BVB4353  ADZ0566  BVB4581  BVB4401 '
		);
		expect(statsLineItems[5].textContent).toBe(
			'Top sessions: 4  on  3 Dec 2025 3  on  16 Dec 2025 3  on  9 Nov 2025 2  on  20 Dec 2025 2  on  8 Nov 2025 '
		);
	});
	it('should show table of every individual bird', async () => {
		render(
			await Page({
				params: new Promise((resolve) =>
					resolve({ speciesName: "Cetti's Warbler" })
				)
			})
		);
		const speciesTable = await screen.findByTestId('species-table');
		verifyTableData(speciesTable, [
			['Ring', 'Encounters', 'First record', 'Last record', 'Proven age'],
			['BVB4353', '3', '09 November 2025', '14 January 2026', '1'],
			['ADZ0566', '3', '08 November 2025', '20 December 2025', '0'],
			['BVB4581', '3', '09 November 2025', '16 December 2025', '0'],
			['BVB4401', '3', '08 November 2025', '16 December 2025', '0'],
			['BVB4420', '2', '03 December 2025', '16 December 2025', '0'],
			['BVB4138', '1', '09 November 2025', '09 November 2025', '0']
		]);
	});
	// todo fix the async issues
	it.skip('should allow each individual bird to be expanded', async () => {
		render(
			await Page({
				params: new Promise((resolve) =>
					resolve({ speciesName: "Cetti's Warbler" })
				)
			})
		);
		const speciesTable = await screen.findByTestId('species-table');
		const topLevelBodyEl = speciesTable.querySelector(
			':scope > tbody'
		) as HTMLElement;
		const beforeRowEls = getAllByRole(topLevelBodyEl, 'row');
		const beforeRowCount = beforeRowEls.length;
		const targetRowEl = beforeRowEls[beforeRowCount - 1];
		const expandButton = getByRole(
			getAllByRole(targetRowEl, 'cell')[0],
			'button'
		);
		expect(expandButton).toBeDefined();
		fireEvent.click(expandButton);
		await waitFor(() => {
			const afterRowEls = getAllByRole(topLevelBodyEl, 'row');
			expect(afterRowEls.length).toBeGreaterThan(beforeRowCount);
		});
		const afterRowEls = getAllByRole(topLevelBodyEl, 'row').filter(
			(row) => row.parentElement === topLevelBodyEl
		);
		expect(afterRowEls).toHaveLength(beforeRowCount + 1);
		const expandedRowEl = afterRowEls[afterRowEls.length - 1];
		expect(expandedRowEl.querySelectorAll(':scope > td')).toHaveLength(1);

		verifyTableData(getByRole(expandedRowEl, 'table'), [
			['Date', 'Time', 'Age', 'Sex', 'Wing', 'Weight'],
			['2025-11-09', '07:20:00', '2', 'U', '56', '11.2']
		]);
	});
});
