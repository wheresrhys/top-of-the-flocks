import { TopPeriodsResult } from '@/types/graphql.types';
import type { PanelDefinition } from '../components/StatsAccordion';
import { gql } from 'graphql-tag';
import { graphqlRequest } from '@/lib/graphql-client';
import type { GraphQLResponse } from '@/lib/graphql-client';
import type { HeadlineStat } from '../components/StatsAccordion';
import type { CamelCase, KebabCase } from 'type-fest';

function kebabToCamel(str: KebabCase<string>): CamelCase<string> {
	return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function getTopPeriodsByMetricFragment(
	panel: PanelDefinition,
	results: number
): string {
	return `
    topPeriodsByMetric(
      args: {
        metricName: "${panel.metricName}"
        temporalUnit: "${panel.temporalUnit}"
        resultLimit: ${results}
        monthFilter: ${panel.monthFilter || null}
				yearFilter: ${panel.yearFilter || null}
				exactMonthsFilter: ${panel.exactMonthsFilter ? JSON.stringify(panel.exactMonthsFilter) : null}
      }
    ) {
      metricValue
      visitDate
    }
  `;
}

export async function fetchInitialData(
	panels: PanelDefinition[]
): Promise<HeadlineStat[]> {
	const gqlQuery = gql`
		query {
			${panels
				.map(
					(panel) =>
						`${kebabToCamel(panel.id)}: ${getTopPeriodsByMetricFragment(panel, 1)}`
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

export async function fetchDrillDownData(
	panel: PanelDefinition
): Promise<TopPeriodsResult[] | undefined> {
	const gqlQuery = gql`
		query {
			${getTopPeriodsByMetricFragment(panel, 5)}
		}
	`;

	const { data }: GraphQLResponse<{ topPeriodsByMetric: TopPeriodsResult[] }> =
		await graphqlRequest<{ topPeriodsByMetric: TopPeriodsResult[] }>(gqlQuery);
	return data?.topPeriodsByMetric;
}
