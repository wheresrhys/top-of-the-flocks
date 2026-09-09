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
	describe('Edge', () => {
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
});
