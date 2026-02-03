import { expect, describe, it, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	getByRole,
	getAllByRole,
	fireEvent
} from '@testing-library/react';
import Page from '../bird/[ring]/page';

describe('bird page', () => {
	// it('should render stats accordions', async () => {
	//   render(await Page({ params: new Promise((resolve) => resolve({ ring: 'R12345' })) }));
	//   const accordionGroups = await screen.findAllByTestId(
	//     'stats-accordion-group'
	//   );
	//   accordionGroups.map((accordionGroup) => {
	//     const heading = getByRole(accordionGroup, 'heading', {
	//       level: 2
	//     });
	//     expect(heading.textContent).toMatch(/[a-z ]+:/i);
	//     const accordionWrapper = accordionGroup.querySelector(
	//       ':scope > ul, :scope > ol'
	//     );
	//     getAllByRole(accordionGroup, 'button')
	//       .filter((button) => {
	//         const closestListItem = button.closest('li');
	//         return (
	//           closestListItem &&
	//           closestListItem.parentElement === accordionWrapper
	//         );
	//       })
	//       .forEach((button) => {
	//         expect(button.textContent).toMatch(/^[a-z ]+: [0-9]+ [a-z]+$/i);
	//       });
	//   });
	// });
});
