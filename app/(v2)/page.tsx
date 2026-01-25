import { Suspense } from 'react';
import { StatsAccordion, PanelDefinition } from './components/StatsAccordion';
import { fetchInitialData } from './api/stats-accordion';
import { unstable_cache } from 'next/cache';

const panelDefinitions: PanelDefinition[] = [
	{
		id: 'busiest-session-ever',
		category: 'Busiest session ever',
		unit: 'Birds',
		dataArguments: { temporal_unit: 'day', metric_name: 'encounters' }
	},
	{
		id: 'most-varied-session-ever',
		category: 'Most varied session ever',
		unit: 'Species',
		dataArguments: { temporal_unit: 'day', metric_name: 'species' }
	},
	{
		id: 'busiest-winter-session-ever',
		category: 'Busiest winter session ever (TODO: need multiple months filter)',
		unit: 'Birds',
		dataArguments: {
			temporal_unit: 'day',
			metric_name: 'encounters',
			month_filter: 1
		}
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
		dataArguments: { temporal_unit: 'month', metric_name: 'encounters' }
	},
	{
		id: 'Busiest-session-this-winter',
		category: 'Busiest session this winter',
		unit: 'Birds',
		dataArguments: {
			temporal_unit: 'day',
			metric_name: 'encounters',
			// TODO need to generate dynamically
			exact_months_filter: ['2025-11', '2025-12', '2026-01']
		}
	},
	{
		id: 'most-varied-session-this-winter',
		category: 'Most varied session this winter',
		unit: 'Species',
		dataArguments: {
			temporal_unit: 'day',
			metric_name: 'species',
			// TODO need to generate dynamically
			exact_months_filter: ['2025-11', '2025-12', '2026-01']
		}
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
