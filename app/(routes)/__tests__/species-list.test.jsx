import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../species/page';
import { verifyTableData } from './helpers/verify-table-data';

describe('species list page', () => {
	it('should show a table of species data', async () => {
		render(await Page());
		const speciesTable = await screen.findByRole('table');
		verifyTableData(
			speciesTable,
			[
				[
					'Species',
					'IndividualsInds',
					'EncountersEncs',
					'SessionsSess',
					'Max retraps',
					'Max Wing',
					'Avg Wing',
					'Min Wing',
					'Max Weight',
					'Avg Weight',
					'Min Weight'
				],
				[
					'Chiffchaff',
					'65',
					'68',
					'6',
					'2',
					'66',
					'61.3',
					'56',
					'10.6',
					'7.7',
					'6.1'
				],
				[
					'Long-tailed Tit',
					'19',
					'26',
					'4',
					'2',
					'64',
					'61.2',
					'57',
					'8.3',
					'7.2',
					'6.4'
				],
				[
					"Cetti's Warbler",
					'6',
					'15',
					'6',
					'3',
					'65',
					'59.9',
					'55',
					'15.1',
					'13.0',
					'11.1'
				],
				[
					'Blue Tit',
					'9',
					'10',
					'6',
					'2',
					'64',
					'61.9',
					'60',
					'11.1',
					'10.3',
					'9.9'
				],
				[
					'Goldcrest',
					'10',
					'10',
					'5',
					'1',
					'56',
					'54.8',
					'53',
					'6',
					'5.5',
					'5.1'
				],
				[
					'Reed Bunting',
					'7',
					'7',
					'2',
					'1',
					'80',
					'76.4',
					'74',
					'19.2',
					'18.0',
					'17.1'
				],
				['Wren', '6', '7', '5', '2', '50', '47.9', '46', '10.8', '9.5', '8.7'],
				[
					'Great Tit',
					'6',
					'6',
					'4',
					'1',
					'77',
					'74.8',
					'71',
					'20.5',
					'18.4',
					'17.1'
				],
				[
					'Robin',
					'5',
					'5',
					'2',
					'1',
					'77',
					'74.6',
					'72',
					'19.5',
					'18.3',
					'16.1'
				],
				[
					'Dunnock',
					'2',
					'3',
					'2',
					'2',
					'73',
					'72.0',
					'71',
					'20.7',
					'20.2',
					'19.7'
				]
			],
			{ isPartial: true }
		);
	});
});
