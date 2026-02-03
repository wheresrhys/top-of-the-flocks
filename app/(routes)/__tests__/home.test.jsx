import { expect, describe, it } from 'vitest';
import {
	render,
	screen,
	getByRole,
	getAllByRole
} from '@testing-library/react';
import Page from '../page';
describe('home page', () => {
	it('should render page content', async () => {
		render(await Page());
		const accordionGroups = await screen.findAllByTestId(
			'stats-accordion-group'
		);
		accordionGroups.map((accordionGroup) => {
			const heading = getByRole(accordionGroup, 'heading', {
				level: 2
			});
			expect(heading.textContent).toMatch(/[a-z ]+:/i);
			const buttons = getAllByRole(accordionGroup, 'button');
			buttons.map((button) => {
				expect(button.textContent).toMatch(/[a-z ]+: [0-9]+ [a-z]+/i);
			});
		});
	});
});
