import { Suspense } from 'react';
import { StatsAccordion, PanelDefinition } from './components/StatsAccordion';
import { fetchInitialData } from './api/stats-accordion';
import { unstable_cache } from 'next/cache';
import { getSeasonMonths, getSeasonName } from './lib/season-month-mapping';
import formatDate from 'intl-dateformat';

function getMonthName(date: Date): string {
	return formatDate(date, 'MMMM');
}
function getPanelDefinitions(date: Date): PanelDefinition[] {
	return [
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
			id: `busiest-${getSeasonName(date)}-session-ever`,
			category: `Busiest ${getSeasonName(date)} session ever`,
			unit: 'Birds',
			dataArguments: {
				temporal_unit: 'day',
				metric_name: 'encounters',
				months_filter: getSeasonMonths(date, false) as number[]
			}
		},
		{
			id: `most-varied-${getSeasonName(date)}-session-ever`,
			category: `Most varied ${getSeasonName(date)} session ever`,
			unit: 'Species',
			dataArguments: {
				temporal_unit: 'day',
				metric_name: 'species',
				months_filter: getSeasonMonths(date, false) as number[]
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
			id: `busiest-session-this-${getSeasonName(date)}`,
			category: `Busiest session this ${getSeasonName(date)}`,
			unit: 'Birds',
			dataArguments: {
				temporal_unit: 'day',
				metric_name: 'encounters',
				exact_months_filter: getSeasonMonths(date, true) as string[]
			}
		},
		{
			id: `most-varied-session-this-${getSeasonName(date)}`,
			category: `Most varied session this ${getSeasonName(date)}`,
			unit: 'Species',
			dataArguments: {
				temporal_unit: 'day',
				metric_name: 'species',
				exact_months_filter: getSeasonMonths(date, true) as string[]
			}
		},
		{
			id: `best-${getMonthName(date)}-ever`,
			category: `Best ${getMonthName(date)} ever`,
			unit: 'Birds',
			dataArguments: {
				temporal_unit: 'month',
				metric_name: 'encounters',
				month_filter: date.getMonth() + 1
			}
		}
	];
}
// TODO ditch the fetch multiple items from the data library
// jiust keep taht as a pure single postgres function call, and blend
// it with teh rest of the view model in here
async function fetchInitialDataWithCache() {
	return unstable_cache(
		async () => {
			return fetchInitialData(getPanelDefinitions(new Date()));
		},
		['home-stats'],
		{
			revalidate: process.env.VERCEL_ENV === 'production' ? 3600 * 24 * 7 : 1,
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
