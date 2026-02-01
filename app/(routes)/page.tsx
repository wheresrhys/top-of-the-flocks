import {
	StatsAccordion,
	PanelDefinition,
	type StatsAccordionModel
} from '../components/StatsAccordion';
import { fetchPanelData } from '../lib/stats-accordion';
import { getSeasonMonths, getSeasonName } from '../lib/season-month-mapping';
import { BootstrapPageData } from '../components/BootstrapPageData';
import { RingSearchForm } from '../components/RingSearchForm';
import { PageWrapper } from '../components/DesignSystem';

function getPanelDefinitions(
	date: Date
): { heading: string; stats: PanelDefinition[] }[] {
	return [
		{
			heading: 'Busiest sessions:',
			stats: [
				{
					id: 'busiest-session-all-time',
					category: 'All time',
					unit: 'Birds',
					dataArguments: { temporal_unit: 'day', metric_name: 'encounters' }
				},
				{
					id: `busiest-session-${getSeasonName(date)}`,
					category: `Any ${getSeasonName(date)}`,
					unit: 'Birds',
					dataArguments: {
						temporal_unit: 'day',
						metric_name: 'encounters',
						months_filter: getSeasonMonths(date, false) as number[]
					}
				},
				{
					id: `busiest-session-this-${getSeasonName(date)}`,
					category: `This ${getSeasonName(date)}`,
					unit: 'Birds',
					dataArguments: {
						temporal_unit: 'day',
						metric_name: 'encounters',
						exact_months_filter: getSeasonMonths(date, true) as string[]
					}
				}
			]
		},
		{
			heading: 'Most varied sessions:',
			stats: [
				{
					id: 'most-varied-session-all-time',
					category: 'All time',
					unit: 'Species',
					dataArguments: { temporal_unit: 'day', metric_name: 'species' }
				},
				{
					id: `most-varied-session-${getSeasonName(date)}`,
					category: `Any ${getSeasonName(date)}`,
					unit: 'Species',
					dataArguments: {
						temporal_unit: 'day',
						metric_name: 'species',
						months_filter: getSeasonMonths(date, false) as number[]
					}
				},
				{
					id: `most-varied-session-this-${getSeasonName(date)}`,
					category: `This ${getSeasonName(date)}`,
					unit: 'Birds',
					dataArguments: {
						temporal_unit: 'day',
						metric_name: 'species',
						exact_months_filter: getSeasonMonths(date, true) as string[]
					}
				}
			]
		},
		{
			heading: 'Individual species:',
			stats: [
				{
					id: 'highest-species-day-count-ever',
					category: 'Highest day counts',
					unit: 'Birds',
					bySpecies: true,
					dataArguments: {
						temporal_unit: 'day',
						metric_name: 'encounters'
					}
				},
				{
					id: 'highest-species-month-count-ever',
					category: 'Highest month counts',
					unit: 'Birds',
					bySpecies: true,
					dataArguments: {
						temporal_unit: 'month',
						metric_name: 'individuals'
					}
				},
				{
					id: 'highest-species-year-count-ever',
					category: 'Highest year counts',
					unit: 'Birds',
					bySpecies: true,
					dataArguments: {
						temporal_unit: 'year',
						metric_name: 'individuals'
					}
				}
			]
		}
		//TODO add individual birds stats
		// 	<SecondaryHeading>Individual birds</SecondaryHeading>
		// 	<BoxyList>
		// 		<BoxyListItem isExpandable={true}>
		// 			Most caught: 12 encounters
		// 		</BoxyListItem>
		// 		<BoxyListItem isExpandable={true}>Oldest: 12 years</BoxyListItem>
		// 		<BoxyListItem isExpandable={true}>Recent peaks: 12 birds</BoxyListItem>
		// 	</BoxyList>
	];
}

async function fetchInitialData(): Promise<StatsAccordionModel[]> {
	const panelDefinitions = getPanelDefinitions(new Date());
	return Promise.all(
		panelDefinitions.map(async (panelGroup) => {
			const panels = await Promise.all(
				panelGroup.stats.map(async (panel) => {
					const data = await fetchPanelData(panel, 1);
					return {
						definition: panel,
						data: data ?? []
					};
				})
			);
			return {
				heading: panelGroup.heading,
				stats: panels
			};
		})
	);
}

function HomePageContent({ data }: { data: StatsAccordionModel[] }) {
	return (
		<PageWrapper>
			<RingSearchForm />
			<StatsAccordion data={data} />
		</PageWrapper>
	);
}

export default async function Home() {
	return (
		<BootstrapPageData<StatsAccordionModel[]>
			getCacheKeys={() => ['home-stats']}
			dataFetcher={fetchInitialData}
			PageComponent={HomePageContent}
		/>
	);
}
