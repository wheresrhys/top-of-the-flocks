import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { SpBusiestSessionsTab } from '../SpBusiestSessionsTab';
import type { TopPeriodsResult } from '@/app/models/db';

vi.mock('@/app/actions/sp-data', () => ({
	fetchTopSessions: vi.fn()
}));

const topSessionsSnapshot: TopPeriodsResult[] = [
	{ visit_date: '2023-05-12', metric_value: 7 },
	{ visit_date: '2022-04-30', metric_value: 7 },
	{ visit_date: '2022-06-15', metric_value: 6 },
	{ visit_date: '2022-08-10', metric_value: 4 },
	{ visit_date: '2022-10-20', metric_value: 3 }
] as TopPeriodsResult[];

const viewedGroup = { id: 1, slug: 'alpha' };

describe('SpBusiestSessionsTab', () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(async () => {
		const { fetchTopSessions } = await import('@/app/actions/sp-data');
		vi.mocked(fetchTopSessions).mockReset();
		vi.mocked(fetchTopSessions).mockResolvedValue(topSessionsSnapshot);
	});

	describe('Usual', () => {
		it('renders loading spinner before data loads', async () => {
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			let resolveData!: (v: TopPeriodsResult[]) => void;
			vi.mocked(fetchTopSessions).mockReturnValue(
				new Promise((resolve) => {
					resolveData = resolve;
				})
			);
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={true}
				/>
			);
			expect(document.querySelector('.loading')).toBeTruthy();
			resolveData(topSessionsSnapshot);
		});

		it('renders busiest-session badges after data loads', async () => {
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={true}
				/>
			);
			await waitFor(() => {
				expect(document.querySelectorAll('li').length).toBe(
					topSessionsSnapshot.length
				);
			});
			expect(screen.getAllByText('7').length).toBeGreaterThan(0);
		});
	});

	describe('Structure', () => {
		it('does not fetch until isActive is true', async () => {
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={false}
				/>
			);
			expect(fetchTopSessions).not.toHaveBeenCalled();
		});

		it('passes year/month through when scoped', async () => {
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					year={2026}
					month={8}
					isActive={true}
				/>
			);
			await waitFor(() => {
				expect(fetchTopSessions).toHaveBeenCalledWith('Robin', 1, 2026, 8);
			});
		});

		it('omits year/month on the all-time page', async () => {
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={true}
				/>
			);
			await waitFor(() => {
				expect(fetchTopSessions).toHaveBeenCalledWith(
					'Robin',
					1,
					undefined,
					undefined
				);
			});
		});
	});

	describe('Edge', () => {
		it('shows "No busiest sessions found" when empty', async () => {
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			vi.mocked(fetchTopSessions).mockResolvedValue([]);
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={true}
				/>
			);
			await waitFor(() => {
				expect(screen.getByText('No busiest sessions found')).toBeTruthy();
			});
		});

		it('falls back to empty state and logs error when fetch rejects', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const { fetchTopSessions } = await import('@/app/actions/sp-data');
			vi.mocked(fetchTopSessions).mockRejectedValue(new Error('boom'));
			render(
				<SpBusiestSessionsTab
					speciesName="Robin"
					viewedGroupId={1}
					viewedGroup={viewedGroup}
					isActive={true}
				/>
			);
			await waitFor(() => {
				expect(screen.getByText('No busiest sessions found')).toBeTruthy();
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to fetch species busiest sessions',
				expect.objectContaining({ speciesName: 'Robin', viewedGroupId: 1 })
			);
			consoleErrorSpy.mockRestore();
		});
	});
});
