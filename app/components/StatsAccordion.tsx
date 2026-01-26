'use client';
import { useState } from 'react';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import formatDate from 'intl-dateformat';

import { fetchDrillDownData } from '../api/stats-accordion';
import type {
	StatsAccordionArguments,
	TopPeriodsResult
} from '../api/stats-accordion';
type TemporalUnit = 'day' | 'month' | 'year';

export type StatsAccordionModel = {
	definition: PanelDefinition;
	data: TopPeriodsResult[] | null;
};

export type SingleStatModel = {
	definition: PanelDefinition;
	data: TopPeriodsResult;
	showUnit: boolean;
};
export type PanelDefinition = {
	id: string;
	category: string;
	unit: string;
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

function StatOutput({ definition, data, showUnit }: SingleStatModel) {
	return (
		<Typography variant="body2">
			<b>
				{data.metric_value}
				{showUnit ? ` ${definition.unit}` : ''}
			</b>{' '}
			{
				connectingVerbMap[
					definition.dataArguments.temporal_unit as TemporalUnit
				] as string
			}{' '}
			{definition.dataArguments.temporal_unit === 'day' ? (
				<Link href={`/session/${data.visit_date}`}>
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
		</Typography>
	);
}

function hasData(data: TopPeriodsResult[] | null): data is TopPeriodsResult[] {
	return data !== null;
}
function AccordionItem({
	model,
	onExpanded,
	expandedId
}: {
	model: StatsAccordionModel;
	onExpanded: (id: string | false) => void;
	expandedId: string | false;
}) {
	const [data, setData] = useState<TopPeriodsResult[] | null>(model.data);
	const [isLoading, setLoading] = useState(false);
	const [isLoaded, setLoaded] = useState(false);
	async function onChange(event: React.SyntheticEvent, isAlreadyExpanded: boolean) {
		if (isAlreadyExpanded) {
			onExpanded(false);
		} else {
			onExpanded(model.definition.id);
			if (!isLoaded) {
				setLoading(true);
				await fetchDrillDownData(model.definition).then(setData);
				setLoaded(true);
				setLoading(false);
			}
		}
	}

	return (
		<div className={`accordion-item ${expandedId === model.definition.id ? 'active' : ''}`} id={model.definition.id}>
			<button onClick={(event) => onChange(event, expandedId === model.definition.id)} className="accordion-toggle inline-flex items-center justify-between text-start" aria-controls={`${model.definition.id}-content`} aria-expanded={expandedId === model.definition.id} id={`${model.definition.id}-header`}>
				<Typography
					component="span"
					sx={{
						fontWeight: 700
					}}
				>
					{model.definition.category}:
				</Typography>
				<Typography component="span">
					{data?.[0].metric_value} {model.definition.unit}
				</Typography>
				<span className="icon-[tabler--chevron-left] accordion-item-active:-rotate-90 size-5 shrink-0 transition-transform duration-300 rtl:-rotate-180" ></span>
			</button>
			<div id={`${model.definition.id}-content`} className={`accordion-content w-full ${expandedId === model.definition.id ? '' : 'hidden'} overflow-hidden transition-[height] duration-300`} aria-labelledby={`${model.definition.id}-header`} role="region">
				<div className="px-5 pb-4">
					{hasData(data) ? (
						<List component="ol">
							{data.map((item) => (
								<ListItem disablePadding key={item.visit_date}>
									<ListItemText>
										<StatOutput
											data={item}
											definition={model.definition}
											showUnit={true}
										/>
									</ListItemText>
								</ListItem>
							))}
							{isLoading && (
								<Stack alignItems="center">
									<CircularProgress size={20} />
								</Stack>
							)}
						</List>
					) : (
						<Typography component="span">No data available</Typography>
					)}
				</div>
			</div>
		</div>
	)
}

export function StatsAccordion({ data }: { data: StatsAccordionModel[] }) {
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<>
			{data !== null ? (
				<div className="accordion divide-neutral/20 divide-y">
				{data.map((item) => (
					<AccordionItem
						key={item.definition.id}
						model={item}
						onExpanded={(id) => setExpanded(id)}
						expandedId={expanded}
					/>
				))}
			</div>
			) : (
				<Typography component="span">No data available</Typography>
			)}
		</>
	);
}


