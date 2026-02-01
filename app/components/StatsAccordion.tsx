'use client';
import { useState, useEffect } from 'react';
import { AccordionItem } from './Accordion';
import { SecondaryHeading, BoxyList } from './DesignSystem';
import { StatOutput } from './StatOutput';
import type { TopPeriodsResult, TopSpeciesResult } from './StatOutput';
import {
	getTopStats,
	type TopStatsArguments
} from '@/app/isomorphic/stats-data-tables';
import type { TemporalUnit } from './StatOutput';

export type StatConfig = {
	id: string;
	category: string;
	unit: string;
	bySpecies?: boolean;
	dataArguments: TopStatsArguments;
};

export type AccordionItemModel = {
	definition: StatConfig;
	data: TopPeriodsResult[] | TopSpeciesResult[] | null;
};

export type StatsAccordionModel = {
	heading: string;
	stats: AccordionItemModel[];
};

function hasData(data: TopPeriodsResult[] | null): data is TopPeriodsResult[] {
	return data !== null;
}

function ContentComponent({
	model,
	expandedId
}: {
	model: AccordionItemModel;
	expandedId: string | false;
}) {
	const [data, setData] = useState<TopPeriodsResult[] | null>(model.data);
	const [isLoading, setLoading] = useState(false);
	const [isLoaded, setLoaded] = useState(false);

	useEffect(() => {
		if (expandedId === model.definition.id) {
			let cancelSetLoading = false;
			if (!isLoaded) {
				// avoid the annoying microsecond flash of a spinner
				setTimeout(() => {
					if (!cancelSetLoading) {
						setLoading(true);
					}
				}, 100);
				getTopStats(Boolean(model.definition.bySpecies), {
					...model.definition.dataArguments,
					result_limit: 5
				})
					.then((data) => {
						setData(data);
					})
					.catch((error) => {
						console.error(error);
					})
					.finally(() => {
						setLoaded(true);
						cancelSetLoading = true;
						setLoading(false);
					});
			}
		}
	}, [expandedId]);
	return hasData(data) ? (
		<ol className="list-inside list-none">
			{data.map((item) => (
				<li className="mb-2" key={item.visit_date}>
					<StatOutput
						value={item.metric_value}
						speciesName={(item as TopSpeciesResult).species_name}
						visitDate={item.visit_date}
						showUnit={true}
						unit={model.definition.unit}
						temporalUnit={
							model.definition.dataArguments.temporal_unit as TemporalUnit
						}
					/>
				</li>
			))}
			{isLoading && (
				<span className="loading loading-spinner loading-xl"></span>
			)}
		</ol>
	) : (
		<span>No data available</span>
	);
}
// TODO shoudln't need to be so careful with ?. all over the place
// maybe need to defined things as non-nullable in the SQL
function HeadingComponent({ model }: { model: AccordionItemModel }) {
	return (
		<span>
			<span className="font-bold">{model.definition.category}:</span>{' '}
			<span>
				{model.data?.[0]?.metric_value} {model.definition.unit}
			</span>
		</span>
	);
}

export function StatsAccordion({ data }: { data: StatsAccordionModel[] }) {
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<>
			{data.map(({ heading, stats }) => (
				<div key={heading}>
					<SecondaryHeading>{heading}</SecondaryHeading>
					<BoxyList>
						{stats.map((item) => (
							<AccordionItem
								key={item.definition.id}
								id={item.definition.id}
								HeadingComponent={HeadingComponent}
								ContentComponent={ContentComponent}
								model={item}
								onToggle={setExpanded}
								expandedId={expanded}
							/>
						))}
					</BoxyList>
				</div>
			))}
		</>
	);
}
