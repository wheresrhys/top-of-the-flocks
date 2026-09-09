import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SpStats } from '../SpStats';
import spPageSnapshot from '@/test-fixtures/snapshots/fetchSpPageData.alpha.robin.json';
import type { FullFatPageData } from '@/app/(routes)/species/[speciesName]/PageContent';

const { birds, speciesStats } = spPageSnapshot as unknown as FullFatPageData;

afterEach(() => {
	cleanup();
});

describe('SpStats', () => {
	describe('Usual', () => {
		it('does not render Birds/Encounters/Sessions/Max per session badges', () => {
			render(
				<SpStats
					birds={birds}
					speciesStats={speciesStats}
					speciesId={1}
					speciesName="Robin"
					viewedGroup={{ id: 1, slug: 'alpha' }}
				/>
			);
			expect(screen.queryByText('Totals:')).toBeNull();
			expect(screen.queryByText(/birds$/)).toBeNull();
			expect(screen.queryByText(/encounters$/)).toBeNull();
			expect(screen.queryByText(/sessions$/)).toBeNull();
			expect(screen.queryByText(/max haul:/)).toBeNull();
		});
	});

	describe('Structure: existing Weight/Wing regression coverage', () => {
		it('does not render a "Top sessions" line', () => {
			render(
				<SpStats
					birds={birds}
					speciesStats={speciesStats}
					speciesId={1}
					speciesName="Robin"
					viewedGroup={{ id: 1, slug: 'alpha' }}
				/>
			);
			expect(screen.queryByText('Top sessions:')).toBeNull();
		});

		it('does not render Weight or Wing sentences in the intro block', () => {
			render(
				<SpStats
					birds={birds}
					speciesStats={speciesStats}
					speciesId={1}
					speciesName="Robin"
					viewedGroup={{ id: 1, slug: 'alpha' }}
				/>
			);
			expect(screen.queryByText(/Weight:/)).toBeNull();
			expect(screen.queryByText(/Wing:/)).toBeNull();
		});
	});

	describe('Edge', () => {
		it('renders without throwing when bird_count/encounter_count/session_count/max_per_session are missing, and shows no Totals badges', () => {
			const statsWithoutTotals = { ...speciesStats } as Record<string, unknown>;
			delete statsWithoutTotals.bird_count;
			delete statsWithoutTotals.encounter_count;
			delete statsWithoutTotals.session_count;
			delete statsWithoutTotals.max_per_session;

			expect(() =>
				render(
					<SpStats
						birds={birds}
						speciesStats={statsWithoutTotals as unknown as typeof speciesStats}
						speciesId={1}
						speciesName="Robin"
						viewedGroup={{ id: 1, slug: 'alpha' }}
					/>
				)
			).not.toThrow();
			expect(screen.queryByText('Totals:')).toBeNull();
		});
	});
});
