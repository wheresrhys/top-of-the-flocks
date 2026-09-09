import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { EmptyMonthsToggle } from '../EmptyMonthsToggle';

describe('EmptyMonthsToggle', () => {
	afterEach(() => {
		cleanup();
	});

	describe('Usual', () => {
		it('renders the "Empty months:" label and Show/Hide radios', () => {
			render(<EmptyMonthsToggle value={false} onChange={() => {}} />);
			expect(screen.getByText('Empty months:')).not.toBeNull();
			expect(screen.getByRole('radio', { name: 'Show' })).toBeInstanceOf(
				HTMLInputElement
			);
			expect(screen.getByRole('radio', { name: 'Hide' })).toBeInstanceOf(
				HTMLInputElement
			);
		});

		it('calls onChange with the corresponding value when a radio is clicked', () => {
			const onChange = vi.fn();
			render(<EmptyMonthsToggle value={false} onChange={onChange} />);
			fireEvent.click(screen.getByRole('radio', { name: 'Hide' }));
			expect(onChange).toHaveBeenCalledWith(true);
		});
	});

	describe('Structure', () => {
		it('checks the Show radio when value is false', () => {
			render(<EmptyMonthsToggle value={false} onChange={() => {}} />);
			expect(screen.getByRole('radio', { name: 'Show' })).toHaveProperty(
				'checked',
				true
			);
			expect(screen.getByRole('radio', { name: 'Hide' })).toHaveProperty(
				'checked',
				false
			);
		});

		it('checks the Hide radio when value is true', () => {
			render(<EmptyMonthsToggle value={true} onChange={() => {}} />);
			expect(screen.getByRole('radio', { name: 'Hide' })).toHaveProperty(
				'checked',
				true
			);
			expect(screen.getByRole('radio', { name: 'Show' })).toHaveProperty(
				'checked',
				false
			);
		});
	});
});
