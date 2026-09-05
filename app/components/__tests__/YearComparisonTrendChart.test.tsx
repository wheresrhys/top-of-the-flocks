import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import type { LineChartData } from 'react-chartkick';
import {
	toYearOnYearSeries,
	toThisYearSeries,
	yearColors,
	thisYearColors,
	YearComparisonTrendChart
} from '../YearComparisonTrendChart';

// chartkick registers Chart.js as a side effect; the chart itself is mocked so
// no real canvas renders. The mock surfaces its `data`/`xtitle`/`colors` props so
// tests can assert what each chart was handed.
vi.mock('chartkick/chart.js', () => ({}));
vi.mock('react-chartkick', () => ({
	LineChart: ({
		data,
		xtitle,
		colors
	}: {
		data: LineChartData[];
		xtitle: string;
		colors?: string[];
	}) => (
		<div
			data-testid="line-chart"
			data-xtitle={xtitle}
			data-colors={JSON.stringify(colors)}
			data-series={JSON.stringify(data.map((series) => series.name))}
		/>
	)
}));

const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

describe('toYearOnYearSeries', () => {
	describe('Usual: regrouping monthly points by year', () => {
		it('produces one series per calendar year, named by year', () => {
			const metric: LineChartData = {
				name: 'encounters',
				data: [
					['2023-03-01', 5],
					['2023-06-01', 9],
					['2024-03-01', 7]
				]
			};
			const result = toYearOnYearSeries(metric);
			expect(result.map((series) => series.name)).toEqual(['2023', '2024']);
		});
	});

	describe('Structure: fixed twelve-month axis', () => {
		it('gives every year series all twelve months in Jan→Dec order', () => {
			const metric: LineChartData = {
				name: 'encounters',
				data: [
					['2023-03-01', 5],
					['2024-11-01', 7]
				]
			};
			for (const series of toYearOnYearSeries(metric)) {
				expect(series.data.map(([month]) => month)).toEqual(MONTHS);
			}
		});

		it('places each value in its own calendar-month slot', () => {
			const metric: LineChartData = {
				name: 'encounters',
				data: [
					['2024-01-01', 10],
					['2024-03-01', 30],
					['2024-12-01', 120]
				]
			};
			const [year2024] = toYearOnYearSeries(metric);
			expect(year2024.data[0]).toEqual(['Jan', 10]);
			expect(year2024.data[2]).toEqual(['Mar', 30]);
			expect(year2024.data[11]).toEqual(['Dec', 120]);
		});
	});

	describe('Edge: gaps, emptiness and ordering', () => {
		it('represents months with no data as null', () => {
			const metric: LineChartData = {
				name: 'encounters',
				data: [['2024-03-01', 30]]
			};
			const [year2024] = toYearOnYearSeries(metric);
			expect(year2024.data[0]).toEqual(['Jan', null]);
			expect(year2024.data[2]).toEqual(['Mar', 30]);
		});

		it('returns an empty array for a metric with no points', () => {
			expect(toYearOnYearSeries({ name: 'encounters', data: [] })).toEqual([]);
		});

		it('orders years oldest-first regardless of input order', () => {
			const metric: LineChartData = {
				name: 'encounters',
				data: [
					['2024-01-01', 1],
					['2022-01-01', 1],
					['2023-01-01', 1]
				]
			};
			expect(toYearOnYearSeries(metric).map((series) => series.name)).toEqual([
				'2022',
				'2023',
				'2024'
			]);
		});
	});
});

describe('toThisYearSeries', () => {
	const metric: LineChartData = {
		name: 'encounters',
		data: [
			// two previous years, plus the current year (2025)
			['2023-03-01', 4],
			['2024-03-01', 8],
			['2023-06-01', 10],
			['2024-06-01', 20],
			['2025-03-01', 99]
		]
	};

	describe('Structure: the four summary series', () => {
		it('emits previous max, min, median, then the current year, in that order', () => {
			const result = toThisYearSeries(metric, 2025);
			expect(result.map((series) => series.name)).toEqual([
				'Previous max',
				'Previous min',
				'Previous median',
				'2025'
			]);
		});

		it('makes the min series fill back to the preceding max series', () => {
			const [, min] = toThisYearSeries(metric, 2025);
			expect(min.dataset).toMatchObject({ fill: '-1' });
		});
	});

	describe('Usual: summarising previous years month-by-month', () => {
		it('takes max/min/median across previous years per month', () => {
			const [max, min, median] = toThisYearSeries(metric, 2025);
			// March: previous years 4 and 8
			expect(max.data[2]).toEqual(['Mar', 8]);
			expect(min.data[2]).toEqual(['Mar', 4]);
			expect(median.data[2]).toEqual(['Mar', 6]);
		});

		it('plots the current year on its own line, excluded from the summary', () => {
			const [max, , , currentYear] = toThisYearSeries(metric, 2025);
			expect(currentYear.data[2]).toEqual(['Mar', 99]);
			// 99 is current-year data, so it never inflates the previous-year max
			expect(max.data[2]).toEqual(['Mar', 8]);
		});
	});

	describe('Edge: months with no previous-year data', () => {
		it('emits null for every summary series in an empty month', () => {
			const [max, min, median] = toThisYearSeries(metric, 2025);
			expect(max.data[0]).toEqual(['Jan', null]);
			expect(min.data[0]).toEqual(['Jan', null]);
			expect(median.data[0]).toEqual(['Jan', null]);
		});
	});
});

describe('yearColors', () => {
	describe('Structure: current year vs previous years', () => {
		it('paints the current year black', () => {
			const colors = yearColors([2023, 2024, 2025], '#3366CC', 2025);
			expect(colors[2]).toBe('#000000');
		});

		it('keeps the most recent previous year at full base strength', () => {
			const colors = yearColors([2023, 2024, 2025], '#3366CC', 2025);
			expect(colors[1]).toBe('#3366cc');
		});

		it('paler for older previous years than for newer ones', () => {
			const colors = yearColors([2023, 2024, 2025], '#3366CC', 2025);
			// 2023 (oldest) is lightened, so its channels sit closer to white (255)
			expect(colors[0]).not.toBe('#3366cc');
			expect(colors[0].toLowerCase()).not.toBe(colors[1].toLowerCase());
		});
	});

	describe('Edge: a single previous year', () => {
		it('uses the full base colour with no lightening', () => {
			const colors = yearColors([2024, 2025], '#3366CC', 2025);
			expect(colors[0]).toBe('#3366cc');
		});
	});
});

describe('thisYearColors', () => {
	it('ends with the full base colour for the current-year line', () => {
		const colors = thisYearColors('#3366CC');
		expect(colors).toHaveLength(4);
		expect(colors[3]).toBe('#3366CC');
	});

	it('shares one pale band colour for the max and min series', () => {
		const colors = thisYearColors('#3366CC');
		expect(colors[0]).toBe(colors[1]);
		expect(colors[0]).not.toBe('#3366cc');
	});
});

describe('YearComparisonTrendChart', () => {
	afterEach(cleanup);

	const series: LineChartData[] = [
		{
			name: 'encounters',
			data: [
				['2023-01-01', 5],
				['2024-01-01', 8]
			]
		},
		{
			name: 'birds',
			data: [
				['2023-01-01', 3],
				['2024-01-01', 6]
			]
		}
	];

	describe('Usual: default all-time view', () => {
		it('renders a single chart of every metric across the full timeline', () => {
			render(<YearComparisonTrendChart series={series} />);
			const charts = screen.getAllByTestId('line-chart');
			expect(charts).toHaveLength(1);
			expect(charts[0].dataset.xtitle).toBe('Year');
			expect(charts[0].dataset.series).toBe(
				JSON.stringify(['encounters', 'birds'])
			);
		});

		it('hands the all-time chart one base colour per metric', () => {
			render(<YearComparisonTrendChart series={series} />);
			const [chart] = screen.getAllByTestId('line-chart');
			expect(JSON.parse(chart.dataset.colors!)).toHaveLength(series.length);
		});
	});

	describe('Structure: compare-years view', () => {
		it('renders one month-axis chart per metric when toggled on', () => {
			render(<YearComparisonTrendChart series={series} />);
			fireEvent.click(screen.getByRole('radio', { name: 'Compare years' }));
			const charts = screen.getAllByTestId('line-chart');
			expect(charts).toHaveLength(2);
			for (const chart of charts) {
				expect(chart.dataset.xtitle).toBe('Month');
			}
		});
	});

	describe('Structure: this-year view', () => {
		it('renders one summary chart per metric when toggled on', () => {
			render(<YearComparisonTrendChart series={series} />);
			fireEvent.click(screen.getByRole('radio', { name: 'This year' }));
			const charts = screen.getAllByTestId('line-chart');
			expect(charts).toHaveLength(2);
			for (const chart of charts) {
				expect(JSON.parse(chart.dataset.series!)).toContain('Previous median');
			}
		});
	});

	describe('Structure: toggling back to all-time', () => {
		it('restores the single all-time chart', () => {
			render(<YearComparisonTrendChart series={series} />);
			fireEvent.click(screen.getByRole('radio', { name: 'Compare years' }));
			fireEvent.click(screen.getByRole('radio', { name: 'All time' }));
			expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
		});
	});
});
