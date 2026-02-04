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
					'Birds',
					'Encounters',
					'Sessions',
					'Max per session',
					'% Birds retrapped',
					'Max time span',
					'Max proven age',
					'Max encountered bird',
					'Max weight',
					'Avg weight',
					'Min weight',
					'Median weight',
					'Max wing',
					'Avg wing',
					'Min wing',
					'Median wing'
				],
				[
					'Chiffchaff',
					'65',
					'68',
					'6',
					'25',
					'5',
					'25',
					'1',
					'2',
					'10.6',
					'7.7',
					'6.1',
					'7.5',
					'66',
					'61.3',
					'56',
					'62'
				],
				[
					'Long-tailed Tit',
					'19',
					'26',
					'4',
					'16',
					'37',
					'38',
					'0',
					'2',
					'8.3',
					'7.2',
					'6.4',
					'7.3',
					'64',
					'61.2',
					'57',
					'61'
				],
				[
					"Cetti's Warbler",
					'6',
					'15',
					'6',
					'4',
					'83',
					'66',
					'1',
					'3',
					'15.1',
					'13',
					'11.1',
					'13.9',
					'65',
					'59.9',
					'55',
					'62'
				],
				[
					'Blue Tit',
					'9',
					'10',
					'6',
					'3',
					'11',
					'38',
					'1',
					'2',
					'11.1',
					'10.3',
					'9.9',
					'10.3',
					'64',
					'61.9',
					'60',
					'62'
				],
				[
					'Goldcrest',
					'10',
					'10',
					'5',
					'6',
					'0',
					'0',
					'1',
					'1',
					'6',
					'5.5',
					'5.1',
					'5.4',
					'56',
					'54.8',
					'53',
					'55'
				],
				[
					'Reed Bunting',
					'7',
					'7',
					'2',
					'5',
					'0',
					'0',
					'1',
					'1',
					'19.2',
					'18',
					'17.1',
					'18',
					'80',
					'76.4',
					'74',
					'76'
				]
			],
			{ isPartial: true }
		);
	});
});
