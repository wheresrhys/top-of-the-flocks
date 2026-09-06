import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor
} from '@testing-library/react';
import { SettingsPageContent } from '../PageContent';
import { updatePublicSummaryEnabled } from '@/app/actions/settings';

vi.mock('@/app/actions/settings', () => ({
	updatePublicSummaryEnabled: vi.fn()
}));

describe('SettingsPageContent', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe('usual cases', () => {
		it('renders the toggle reflecting the current public_areas state (on)', () => {
			render(<SettingsPageContent data={{ publicSummaryEnabled: true }} />);
			const checkbox = screen.getByRole('checkbox', {
				name: 'Make my summary pages public'
			}) as HTMLInputElement;
			expect(checkbox.checked).toBe(true);
		});

		it('renders the toggle reflecting the current public_areas state (off)', () => {
			render(<SettingsPageContent data={{ publicSummaryEnabled: false }} />);
			const checkbox = screen.getByRole('checkbox', {
				name: 'Make my summary pages public'
			}) as HTMLInputElement;
			expect(checkbox.checked).toBe(false);
		});
	});

	describe('structure', () => {
		it('toggling calls updatePublicSummaryEnabled with the new desired state', async () => {
			vi.mocked(updatePublicSummaryEnabled).mockResolvedValue({
				success: true,
				enabled: true
			});
			render(<SettingsPageContent data={{ publicSummaryEnabled: false }} />);
			const checkbox = screen.getByRole('checkbox', {
				name: 'Make my summary pages public'
			});

			fireEvent.click(checkbox);

			await waitFor(() => {
				expect(updatePublicSummaryEnabled).toHaveBeenCalledWith(true);
			});
		});
	});

	describe('edge cases', () => {
		it('shows an error state if the update action fails', async () => {
			vi.mocked(updatePublicSummaryEnabled).mockResolvedValue({
				success: false,
				error: 'Failed to update setting'
			});
			render(<SettingsPageContent data={{ publicSummaryEnabled: false }} />);
			const checkbox = screen.getByRole('checkbox', {
				name: 'Make my summary pages public'
			});

			fireEvent.click(checkbox);

			const alert = await screen.findByRole('alert');
			expect(alert.textContent).toBe('Failed to update setting');
		});
	});
});
