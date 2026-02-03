import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../page';
describe('home page', () => {
	it('should render the page', async () => {
		render(await Page());
		const heading = await screen.findByRole('heading', {
			level: 2,
			name: /Busiest sessions/
		});
		expect(heading).toBeDefined();
	});
});
