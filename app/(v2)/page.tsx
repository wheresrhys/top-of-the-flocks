import { Suspense } from 'react';
import { StatsAccordion, PanelDefinition } from './components/StatsAccordion';
import { fetchInitialData } from './api/stats-accordion';
import { unstable_cache } from 'next/cache';

const panelDefinitions: PanelDefinition[] = [
	{
		id: 'busiest-session-ever',
		category: 'Busiest session ever',
		unit: 'Birds',
		temporalUnit: 'day',
		metricName: 'encounters'
	},
	{
		id: 'most-varied-session-ever',
		category: 'Most varied session ever',
		unit: 'Species',
		temporalUnit: 'day',
		metricName: 'species'
	},
	{
		id: 'busiest-winter-session-ever',
		category: 'Busiest winter session ever (TODO: need multiple months filter)',
		unit: 'Birds',
		temporalUnit: 'day',
		metricName: 'encounters',
		monthFilter: 1
	},
	// {
	// TODO: need an additional metric qualifier of "bySpecies"
	// TODO: could also do with a species filter
	// 	id: 'most-of-one-species-ever',
	// 	category: 'Most of one species in a day ever',
	// 	unit: 'Birds',
	// 	temporalUnit: 'day',
	// },
	{
		id: 'best-month-ever',
		category: 'Best month ever',
		unit: 'Birds',
		temporalUnit: 'month',
		metricName: 'encounters'
	},
	{
		id: 'Busiest-session-this-winter',
		category: 'Busiest session this winter',
		unit: 'Birds',
		temporalUnit: 'day',
		metricName: 'encounters',
		// TODO need to generate dynamically
		exactMonthsFilter: ['2025-11', '2025-12', '2026-01']
	},
	{
		id: 'most-varied-session-this-winter',
		category: 'Most varied session this winter',
		unit: 'Species',
		temporalUnit: 'day',
		metricName: 'species',
		exactMonthsFilter: ['2025-11', '2025-12', '2026-01']
	}
];

async function fetchInitialDataWithCache() {
	return unstable_cache(
		async () => fetchInitialData(panelDefinitions),
		['home-stats'],
		{
			revalidate: 3600 * 24 * 7,
			tags: ['home']
		}
	)();
}

async function DisplayInitialData() {
	const initialData = await fetchInitialDataWithCache();
	return <StatsAccordion data={initialData} />;
}

export default async function Home() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DisplayInitialData />
		</Suspense>
	);
}
