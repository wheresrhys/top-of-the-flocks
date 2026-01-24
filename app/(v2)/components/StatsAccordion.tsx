'use client';
import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import formatDate from 'intl-dateformat';
import type {
	TopPeriodsResult,
	TopPeriodsByMetricArguments
} from '@/types/graphql.types';
import { fetchDrillDownData } from '../data-fetching/stats-accordion';

type TemporalUnit = 'day' | 'month' | 'year';

export type HeadlineStat = {
	definition: PanelDefinition;
	data: TopPeriodsResult | undefined;
};
export type PanelDefinition = TopPeriodsByMetricArguments & {
	id: string;
	category: string;
	unit: string;
	temporalUnit: TemporalUnit;
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

function StatOutput({
	definition,
	data,
	showUnit
}: HeadlineStat & { showUnit: boolean; data: TopPeriodsResult }) {
	return (
		<Typography variant="body2">
			<b>
				{data.metricValue}
				{showUnit ? ` ${definition.unit}` : ''}
			</b>{' '}
			{connectingVerbMap[definition.temporalUnit] as string}{' '}
			{formatDate(
				new Date(data.visitDate as string),
				dateFormatMap[definition.temporalUnit as TemporalUnit]
			)}
		</Typography>
	);
}

function hasData(
	data: TopPeriodsResult[] | undefined
): data is TopPeriodsResult[] {
	return data !== undefined;
}
function AccordionItem({
	headlineStat,
	onExpanded,
	expandedId
}: {
	headlineStat: HeadlineStat;
	onExpanded: (id: string | false) => void;
	expandedId: string | false;
}) {
	const [data, setData] = useState<TopPeriodsResult[] | undefined>(
		headlineStat.data ? [headlineStat.data] : undefined
	);
	const [isFullyLoaded, setFullyLoaded] = useState(false);
	async function onChange(event: React.SyntheticEvent, isExpanded: boolean) {
		if (isExpanded) {
			onExpanded(headlineStat.definition.id);
			if (!isFullyLoaded) {
				await fetchDrillDownData(headlineStat.definition).then(setData);
				setFullyLoaded(true);
			}
		} else {
			onExpanded(false);
		}
	}
	return (
		<Accordion
			onChange={onChange}
			expanded={expandedId === headlineStat.definition.id}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls={`${headlineStat.definition.id}-content`}
				id={`${headlineStat.definition.id}-header`}
			>
				<Typography
					component="span"
					sx={{
						fontWeight: 700
					}}
				>
					{headlineStat.definition.category}:
				</Typography>
				<Typography component="span">
					{data?.[0].metricValue} {headlineStat.definition.unit}
				</Typography>
			</AccordionSummary>
			<AccordionDetails id={`${headlineStat.definition.id}-content`}>
				{hasData(data) ? (
					<List component="ol">
						{data.map((item) => (
							<ListItem disablePadding key={item.visitDate}>
								<ListItemText>
									<StatOutput
										data={item}
										definition={headlineStat.definition}
										showUnit={true}
									/>
								</ListItemText>
							</ListItem>
						))}
					</List>
				) : (
					<Typography component="span">No data available</Typography>
				)}
			</AccordionDetails>
		</Accordion>
	);
}
export function StatsAccordion({ data }: { data: HeadlineStat[] | undefined }) {
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<>
			{data ? (
				data.map((item) => (
					<AccordionItem
						key={item.definition.id}
						headlineStat={item}
						onExpanded={(id) => setExpanded(id)}
						expandedId={expanded}
					/>
				))
			) : (
				<Typography component="span">No data available</Typography>
			)}
		</>
	);
}
