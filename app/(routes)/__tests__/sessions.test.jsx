import { expect, describe, it } from 'vitest';
import {
	render,
	screen,
	getByRole,
	getAllByRole
} from '@testing-library/react';
import Page from '../sessions/page';

describe('session list page', () => {
	it('should show correct heading and subheadings', async () => {
		render(await Page());
		const heading = await screen.findByRole('heading', {
			level: 1
		});
		expect(heading.textContent).toBe('Session history');
		const subheadings = await screen.findAllByRole('heading', {
			level: 2
		});
		subheadings.map((heading, index) => {
			expect(heading.textContent).toMatch(/\d{4}/);
			if (index > 0) {
				expect(heading.textContent).toBe(
					String(Number(subheadings[index - 1].textContent) - 1)
				);
			}
		});
	});
	it('should show session list accordions', async () => {
		render(await Page());
		const accordionGroups = await screen.findAllByTestId(
			'history-accordion-group'
		);
		accordionGroups.map((accordionGroup) => {
			const heading = getByRole(accordionGroup, 'heading', {
				level: 2
			});
			const year = Number(heading.textContent);
			const accordionWrapper = accordionGroup.querySelector(
				':scope > ul, :scope > ol'
			);
			expect(accordionWrapper).toBeDefined();
			getAllByRole(accordionGroup, 'button')
				.filter((button) => {
					const closestListItem = button.closest('li');
					return (
						closestListItem &&
						closestListItem.parentElement === accordionWrapper
					);
				})
				.forEach((button) => {
					expect(button.textContent).toMatch(
						/^[a-z]+: \d+ sessions, \d+ birds$/i
					);
				});
		});
	});
});
