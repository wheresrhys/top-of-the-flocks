import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	render,
	screen,
	cleanup,
	fireEvent,
	within
} from '@testing-library/react';
import Page from '../page';
import spPageSnapshot from '@/test-fixtures/snapshots/fetchSpPageData.alpha.robin.json';
import type { FullFatPageData } from '../PageContent';

const { mockGetAuthenticatedSupabaseClient, mockFetchPageOfBirds } = vi.hoisted(
	() => ({
		mockGetAuthenticatedSupabaseClient: vi.fn(),
		mockFetchPageOfBirds: vi.fn()
	})
);

vi.mock('@/lib/group-auth', () => ({
	getAuthenticatedSupabaseClient: mockGetAuthenticatedSupabaseClient
}));

vi.mock('@/app/actions/sp-data', () => ({
	fetchPageOfBirds: mockFetchPageOfBirds
}));

vi.mock('@/app/components/pages/species/SpIndividualsTab', () => ({
	SpIndividualsTab: () => <div data-testid="sp-individuals-tab" />
}));

vi.mock('@/app/components/pages/species/SpNotableRetrapsTab', () => ({
	SpNotableRetrapsTab: () => <div data-testid="sp-notable-retraps-tab" />
}));

vi.mock('@/app/components/pages/species/SpBusiestSessionsTab', () => ({
	SpBusiestSessionsTab: () => <div data-testid="sp-busiest-sessions-tab" />
}));

vi.mock('@/app/components/pages/species/SpGraphsTab', () => ({
	SpGraphsTab: () => <div data-testid="sp-graphs-tab" />
}));

vi.mock('@/app/components/pages/species/SpBiometricsTab', () => ({
	SpBiometricsTab: () => <div data-testid="sp-biometrics-tab" />
}));

vi.mock('@/app/components/pages/species/SpYearTotalsTab', () => ({
	SpYearTotalsTab: () => <div data-testid="sp-year-totals-tab" />
}));

vi.mock('@/app/components/pages/species/SpCombinedMonthTotalsTab', () => ({
	SpCombinedMonthTotalsTab: () => (
		<div data-testid="sp-combined-month-totals-tab" />
	)
}));

vi.mock('@/app/components/pages/species/SpSessionTotalsTab', () => ({
	SpSessionTotalsTab: () => <div data-testid="sp-session-totals-tab" />
}));

const { birds, speciesStats } = spPageSnapshot as unknown as FullFatPageData;

function makeSpeciesClient() {
	const fromChain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockReturnThis(),
		then: (resolve: (v: { data: unknown; error: null }) => unknown) =>
			Promise.resolve({
				data: { id: spPageSnapshot.speciesId },
				error: null
			}).then(resolve)
	};
	const rpcThenable = {
		then: (resolve: (v: { data: unknown; error: null }) => unknown) =>
			Promise.resolve({ data: [speciesStats], error: null }).then(resolve)
	};
	return {
		from: vi.fn().mockReturnValue(fromChain),
		rpc: vi.fn().mockReturnValue(rpcThenable)
	};
}

function renderSpeciesPage(speciesName = 'Robin') {
	return Page({
		params: Promise.resolve({ speciesName })
	});
}

describe('species detail page', () => {
	afterEach(() => {
		cleanup();
	});

	describe('with full data (Robin fixture)', () => {
		beforeEach(() => {
			mockGetAuthenticatedSupabaseClient.mockResolvedValue(makeSpeciesClient());
			mockFetchPageOfBirds.mockResolvedValue(birds);
		});

		describe('tab order and defaults (all-time page)', () => {
			it('renders tab buttons in the order Year totals, Month totals, Session totals, Highlights, Biometrics, Population, Bird list', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				const labels = within(screen.getByRole('tablist'))
					.getAllByRole('button')
					.map((button) => button.textContent);
				expect(labels).toEqual([
					'Year totals',
					'Month totals',
					'Session totals',
					'Highlights',
					'Biometrics',
					'Population',
					'Bird list'
				]);
				expect(screen.queryByRole('button', { name: 'Graphs' })).toBeNull();
				expect(
					screen.queryByRole('button', { name: 'Trend charts' })
				).toBeNull();
				expect(screen.queryByRole('button', { name: 'Size plot' })).toBeNull();
			});

			it('renders SpYearTotalsTab on initial render without clicking (eager default)', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
			});

			it('does not mount SpIndividualsTab until the Bird list tab is clicked (now lazy)', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				expect(screen.queryByTestId('sp-individuals-tab')).toBeNull();
				fireEvent.click(screen.getByRole('button', { name: 'Bird list' }));
				await screen.findByTestId('sp-individuals-tab');
			});

			it('keeps Bird list mounted after being clicked once even when another tab is reselected', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Bird list' }));
				await screen.findByTestId('sp-individuals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Year totals' }));
				await screen.findByTestId('sp-year-totals-tab');
				// bird-list panel stays mounted (hidden) once loaded
				expect(screen.getByTestId('sp-individuals-tab')).toBeDefined();
			});
		});

		it("shows both 'Year totals' and 'Month totals' tabs on the all-time species page", async () => {
			render(await renderSpeciesPage());
			await screen.findByTestId('sp-year-totals-tab');
			expect(screen.getByRole('button', { name: 'Year totals' })).toBeDefined();
			expect(
				screen.getByRole('button', { name: 'Month totals' })
			).toBeDefined();
		});

		describe('highlights tab (click to activate)', () => {
			it('renders both SpNotableRetrapsTab and SpBusiestSessionsTab after clicking Highlights button', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Highlights' }));
				await screen.findByTestId('sp-notable-retraps-tab');
				await screen.findByTestId('sp-busiest-sessions-tab');
			});
		});

		describe('month-totals tab (click to activate)', () => {
			it('renders SpCombinedMonthTotalsTab after clicking Month totals button', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Month totals' }));
				await screen.findByTestId('sp-combined-month-totals-tab');
			});
		});

		describe('session-totals tab (click to activate)', () => {
			it('renders SpSessionTotalsTab after clicking Session totals button', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Session totals' }));
				await screen.findByTestId('sp-session-totals-tab');
			});

			it('lazily loads SpSessionTotalsTab only once "Session totals" is selected, consistent with the other tabs', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				expect(screen.queryByTestId('sp-session-totals-tab')).toBeNull();
				fireEvent.click(screen.getByRole('button', { name: 'Session totals' }));
				await screen.findByTestId('sp-session-totals-tab');
			});
		});

		describe('biometrics tab (click to activate)', () => {
			it('renders SpBiometricsTab after clicking Biometrics button', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Biometrics' }));
				await screen.findByTestId('sp-biometrics-tab');
			});
		});

		describe('graphs tab (click to activate, labelled "Population")', () => {
			it('renders SpGraphsTab after clicking the Population button', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				fireEvent.click(screen.getByRole('button', { name: 'Population' }));
				await screen.findByTestId('sp-graphs-tab');
			});

			it('lazily loads SpGraphsTab only once "Population" is selected', async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				expect(screen.queryByTestId('sp-graphs-tab')).toBeNull();
				fireEvent.click(screen.getByRole('button', { name: 'Population' }));
				await screen.findByTestId('sp-graphs-tab');
			});

			it("renders a 'Population' button that activates the same panel the 'graphs' tab id always did", async () => {
				render(await renderSpeciesPage());
				await screen.findByTestId('sp-year-totals-tab');
				expect(screen.queryByRole('button', { name: 'Graphs' })).toBeNull();
				fireEvent.click(screen.getByRole('button', { name: 'Population' }));
				await screen.findByTestId('sp-graphs-tab');
			});
		});
	});

	describe('not authorised state (data has speciesId only, no birds)', () => {
		beforeEach(() => {
			mockGetAuthenticatedSupabaseClient.mockResolvedValue(makeSpeciesClient());
			mockFetchPageOfBirds.mockResolvedValue([]);
		});

		it('renders "Not authorised to view any encounter data for this species" message', async () => {
			render(await renderSpeciesPage());
			await screen.findByText(
				'Not authorised to view any encounter data for this species'
			);
		});

		it('does not render tab buttons', async () => {
			render(await renderSpeciesPage());
			await screen.findByText(
				'Not authorised to view any encounter data for this species'
			);
			expect(screen.queryByRole('button', { name: 'Bird list' })).toBeNull();
		});

		it('does not render SpStats', async () => {
			render(await renderSpeciesPage());
			await screen.findByText(
				'Not authorised to view any encounter data for this species'
			);
			expect(screen.queryByTestId('headline-stats')).toBeNull();
		});
	});
});
