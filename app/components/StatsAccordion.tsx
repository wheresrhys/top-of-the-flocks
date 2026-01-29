'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import formatDate from 'intl-dateformat';
import { Accordion } from './Accordion';
import { fetchPanelData } from '../lib/stats-accordion';
import type {
	StatsAccordionArguments,
	TopPeriodsResult,
	TopSpeciesResult
} from '../lib/stats-accordion';

type TemporalUnit = 'day' | 'month' | 'year';

export type StatsAccordionModel = {
	definition: PanelDefinition;
	data: TopPeriodsResult[] | TopSpeciesResult[] | null;
};

export type SingleStatModel = {
	definition: PanelDefinition;
	data: TopPeriodsResult | TopSpeciesResult;
	showUnit: boolean;
};
export type PanelDefinition = {
	id: string;
	category: string;
	unit: string;
	bySpecies?: boolean;
	dataArguments: StatsAccordionArguments;
};
const connectingVerbMap: Record<TemporalUnit, 'in' | 'on'> = {
	day: 'on',
	month: 'in',
	year: 'in'
};

const dateFormatMap: Record<TemporalUnit, string> = {
	day: 'DD MMMM YYYY',
	month: 'MMMM YYYY',
	year: 'YYYY'
};

function dataIsSpeciesResult (definition: PanelDefinition, data: (TopPeriodsResult | TopSpeciesResult)): data is TopSpeciesResult {
	return Boolean(definition.bySpecies)
}

function StatOutput({ definition, data, showUnit }: SingleStatModel) {
	return (
		<>
			<b>
				{data.metric_value} {dataIsSpeciesResult(definition, data) ? data.species_name : showUnit ? ` ${definition.unit}` : ''}
			</b>{' '}
			{
				connectingVerbMap[
					definition.dataArguments.temporal_unit as TemporalUnit
				] as string
			}{' '}
			{definition.dataArguments.temporal_unit === 'day' ? (
				<Link className="link" href={`/session/${data.visit_date}`}>
					{formatDate(
						new Date(data.visit_date as string),
						dateFormatMap[
							definition.dataArguments.temporal_unit as TemporalUnit
						]
					)}
				</Link>
			) : (
				formatDate(
					new Date(data.visit_date as string),
					dateFormatMap[definition.dataArguments.temporal_unit as TemporalUnit]
				)
			)}
		</>
	);
}

function hasData(data: TopPeriodsResult[] | null): data is TopPeriodsResult[] {
	return data !== null;
}

function ContentComponent({
	model,
	expandedId
}: {
	model: StatsAccordionModel;
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
				fetchPanelData(model.definition, 5)
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
	return (
		<div className="px-5 pb-4">
			{hasData(data) ? (
				<ol className="list-inside list-decimal">
					{data.map((item) => (
						<li className="mb-2" key={item.visit_date}>
							<StatOutput
								data={item}
								definition={model.definition}
								showUnit={true}
							/>
						</li>
					))}
					{isLoading && (
						<span className="loading loading-spinner loading-xl"></span>
					)}
				</ol>
			) : (
				<span>No data available</span>
			)}
		</div>
	);
}


function HeadingComponent({
	model,
}: {
	model: StatsAccordionModel;
}) {
	return (
		<span>
			<b>{model.definition.category}:</b>{' '}
			<span>
				{model.data?.[0].metric_value} {model.definition.unit}
			</span>
		</span>
	);
}

export function StatsAccordion({ data }: { data: StatsAccordionModel[] }) {
	return (
		<Accordion
			data={data}
			ContentComponent={ContentComponent}
			HeadingComponent={HeadingComponent}
			getKey={(item) => item.definition.id}
		/>
	);
}
