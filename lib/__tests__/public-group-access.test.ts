import { describe, it, expect, vi, afterEach } from 'vitest';
import { isPublicGroupPageRequest } from '../public-group-access';

const { mockResolveGroupIdBySlug, mockResolveGroupPublicAreasForRequest } =
	vi.hoisted(() => ({
		mockResolveGroupIdBySlug: vi.fn(),
		mockResolveGroupPublicAreasForRequest: vi.fn()
	}));

vi.mock('../group-slug', () => ({
	resolveGroupIdBySlug: mockResolveGroupIdBySlug,
	resolveGroupPublicAreasForRequest: mockResolveGroupPublicAreasForRequest
}));

describe('isPublicGroupPageRequest', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('a summary-subtree path to a public group', () => {
		it('returns true for the base summary path', async () => {
			mockResolveGroupIdBySlug.mockResolvedValue(2);
			mockResolveGroupPublicAreasForRequest.mockResolvedValue(['summary']);

			expect(await isPublicGroupPageRequest('/group/alpha/summary')).toBe(true);
		});

		it('returns true for a year-scoped summary path', async () => {
			mockResolveGroupIdBySlug.mockResolvedValue(2);
			mockResolveGroupPublicAreasForRequest.mockResolvedValue(['summary']);

			expect(await isPublicGroupPageRequest('/group/alpha/summary/2026')).toBe(
				true
			);
		});

		it('returns true for a year/month-scoped summary path', async () => {
			mockResolveGroupIdBySlug.mockResolvedValue(2);
			mockResolveGroupPublicAreasForRequest.mockResolvedValue(['summary']);

			expect(
				await isPublicGroupPageRequest('/group/alpha/summary/2026/3')
			).toBe(true);
		});
	});

	it('returns false for a summary-subtree path to a non-public group', async () => {
		mockResolveGroupIdBySlug.mockResolvedValue(2);
		mockResolveGroupPublicAreasForRequest.mockResolvedValue([]);

		expect(await isPublicGroupPageRequest('/group/alpha/summary')).toBe(false);
	});

	it('returns false for a non-summary path, even to a public group', async () => {
		expect(await isPublicGroupPageRequest('/group/alpha/effort')).toBe(false);
		expect(mockResolveGroupIdBySlug).not.toHaveBeenCalled();
	});

	it('returns false for an unknown groupSlug, without throwing', async () => {
		mockResolveGroupIdBySlug.mockResolvedValue(null);

		expect(await isPublicGroupPageRequest('/group/no-such-group/summary')).toBe(
			false
		);
		expect(mockResolveGroupPublicAreasForRequest).not.toHaveBeenCalled();
	});

	it('returns false for a null pathname', async () => {
		expect(await isPublicGroupPageRequest(null)).toBe(false);
		expect(mockResolveGroupIdBySlug).not.toHaveBeenCalled();
	});
});
