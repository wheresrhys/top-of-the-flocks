import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getGroupCookie } from '@/app/actions/group-cookie';
import CrossGroupLayout from '../layout';

const {
	mockResolveGroupIdBySlug,
	mockResolveGroupPublicAreas,
	mockGetRequestPathname
} = vi.hoisted(() => ({
	mockResolveGroupIdBySlug: vi.fn(),
	mockResolveGroupPublicAreas: vi.fn(),
	mockGetRequestPathname: vi.fn()
}));

vi.mock('@/lib/group-slug', () => ({
	resolveGroupIdBySlug: mockResolveGroupIdBySlug,
	resolveGroupPublicAreas: mockResolveGroupPublicAreas
}));

vi.mock('@/lib/request-pathname', () => ({
	getRequestPathname: mockGetRequestPathname
}));

function renderLayout(groupSlug = 'alpha') {
	return CrossGroupLayout({
		children: <p>child content</p>,
		params: Promise.resolve({ groupSlug })
	});
}

describe('cross-group layout', () => {
	beforeEach(() => {
		vi.mocked(getGroupCookie).mockResolvedValue(1);
		mockGetRequestPathname.mockResolvedValue('/group/alpha/summary');
		mockResolveGroupIdBySlug.mockResolvedValue(2);
		mockResolveGroupPublicAreas.mockResolvedValue([]);
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe('authenticated (has a session cookie)', () => {
		it('renders children regardless of pathname or target public_areas', async () => {
			render(await renderLayout());
			expect(screen.getByText('child content')).toBeDefined();
		});

		it('does not redirect', async () => {
			await renderLayout();
			expect(vi.mocked(redirect)).not.toHaveBeenCalled();
		});

		it('does not need to resolve pathname or public_areas at all', async () => {
			await renderLayout();
			expect(mockGetRequestPathname).not.toHaveBeenCalled();
			expect(mockResolveGroupPublicAreas).not.toHaveBeenCalled();
		});
	});

	describe('unauthenticated (no session cookie)', () => {
		beforeEach(() => {
			vi.mocked(getGroupCookie).mockResolvedValue(null);
		});

		describe('a summary-subtree request to a public group', () => {
			beforeEach(() => {
				mockGetRequestPathname.mockResolvedValue('/group/alpha/summary');
				mockResolveGroupPublicAreas.mockResolvedValue(['summary']);
			});

			it('lets the request through with no cookie', async () => {
				render(await renderLayout());
				expect(screen.getByText('child content')).toBeDefined();
				expect(vi.mocked(redirect)).not.toHaveBeenCalled();
			});

			it('lets a year/month-scoped summary path through too', async () => {
				mockGetRequestPathname.mockResolvedValue('/group/alpha/summary/2026/3');
				render(await renderLayout());
				expect(screen.getByText('child content')).toBeDefined();
			});
		});

		describe('a summary-subtree request to a non-public group', () => {
			beforeEach(() => {
				mockGetRequestPathname.mockResolvedValue('/group/alpha/summary');
				mockResolveGroupPublicAreas.mockResolvedValue([]);
			});

			it('redirects to "/"', async () => {
				await renderLayout();
				expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
			});

			it('does not render children', async () => {
				vi.mocked(redirect).mockImplementationOnce(() => {
					throw new Error('NEXT_REDIRECT');
				});
				await expect(renderLayout()).rejects.toThrow('NEXT_REDIRECT');
				expect(screen.queryByText('child content')).toBeNull();
			});
		});

		describe('a non-summary request, even to a public group', () => {
			beforeEach(() => {
				mockGetRequestPathname.mockResolvedValue('/group/alpha/effort');
				mockResolveGroupPublicAreas.mockResolvedValue(['summary']);
			});

			it('still redirects to "/" (out of scope: only summary is publishable)', async () => {
				await renderLayout();
				expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
			});
		});

		describe('an unknown groupSlug on a summary-subtree request', () => {
			beforeEach(() => {
				mockGetRequestPathname.mockResolvedValue(
					'/group/no-such-group/summary'
				);
				mockResolveGroupIdBySlug.mockResolvedValue(null);
			});

			it('redirects gracefully to "/" instead of throwing', async () => {
				await renderLayout('no-such-group');
				expect(vi.mocked(redirect)).toHaveBeenCalledWith('/');
				expect(mockResolveGroupPublicAreas).not.toHaveBeenCalled();
			});
		});
	});
});
