import type { TopPeriodsResult } from '@/types/graphql.types';
import { Suspense } from 'react';
import { gql } from 'graphql-tag';
import { graphqlRequest } from '@/lib/graphql-client';
import { cacheTag, cacheLife } from 'next/cache';
import {
	StatsAccordion,
	type HeadlineStat,
	PanelDefinition
} from './components/StatsAccordion';
import type { GraphQLResponse } from '@/lib/graphql-client';

function kebabToCamel(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

async function fetchInitialData(
	panels: PanelDefinition[]
): Promise<HeadlineStat[]> {
	const gqlQuery = gql`
		query {
			${panels
				.map(
					(panel) => `${kebabToCamel(panel.id)}: topPeriodsByMetric(
			args: {
				metricName: "${panel.metricName}"
				temporalUnit: "${panel.temporalUnit}"
				resultLimit: 1
				monthFilter: ${panel.monthFilter || null}
				yearFilter: ${panel.yearFilter || null}
				exactMonthsFilter: ${panel.exactMonthsFilter ? JSON.stringify(panel.exactMonthsFilter) : null}
			}
		) {
			metricValue
			visitDate
		}`
				)
				.join('\n\n')}
		}
	`;

	const { data }: GraphQLResponse<Record<string, TopPeriodsResult[]>> =
		await graphqlRequest<Record<string, TopPeriodsResult[]>>(gqlQuery);
	return panels.map((panel) => ({
		definition: panel,
		data: data?.[kebabToCamel(panel.id)]?.[0]
	}));
}

async function lazilyFetchInitialData() {
	'use cache';
	// This cache can be revalidated by webhook or server action
	// when you call revalidateTag("articles")
	cacheTag('home');
	// This cache will revalidate after an hour even if no explicit
	// revalidate instruction was received
	cacheLife('hours');
	return fetchInitialData(panelDefinitions);
}

export default async function Home() {
	const initialData = await lazilyFetchInitialData();
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<StatsAccordion data={initialData} />
		</Suspense>
	);
}
