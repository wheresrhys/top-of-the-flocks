import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAccessibleAggregateStats } from '@/lib/group-summary-access';
import type { AggregateStatsResult } from '@/app/models/db';
import { fetchSpeciesData } from '../spp-data';

vi.mock('@/lib/group-summary-access', () => ({
	fetchAccessibleAggregateStats: vi.fn()
}));

const ROW = { encounter_count: 5 } as unknown as AggregateStatsResult;

describe('fetchSpeciesData — routes through the group-summary access helper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('requests species-grouped stats scoped to the given date range', async () => {
		vi.mocked(fetchAccessibleAggregateStats).mockResolvedValue([ROW]);

		const result = await fetchSpeciesData(1, '2026-01-01', '2026-12-31');

		expect(result).toEqual([ROW]);
		expect(fetchAccessibleAggregateStats).toHaveBeenCalledWith(1, {
			from_date: '2026-01-01',
			to_date: '2026-12-31',
			group_by_species: true
		});
	});
});
