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
import { KebabCase } from 'type-fest';

import { fetchDrillDownData } from '../api/stats-accordion';
import type { Database } from '@/types/supabase.types';
type DataArguments =
	Database['public']['Functions']['top_periods_by_metric']['Args'];
type TopPeriodsResult =
	Database['public']['Functions']['top_periods_by_metric']['Returns'][number];
type TemporalUnit = 'day' | 'month' | 'year';

export type HeadlineStat = {
	definition: PanelDefinition;
	data: TopPeriodsResult | null;
};
export type PanelDefinition = {
	id: KebabCase<string>;
	category: string;
	unit: string;
	dataArguments: DataArguments;
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
	headlineStat,
	onExpanded,
	expandedId
}: {
	headlineStat: HeadlineStat;
	onExpanded: (id: string | false) => void;
	expandedId: string | false;
}) {
	const [data, setData] = useState<TopPeriodsResult[] | null>(
		headlineStat.data ? [headlineStat.data] : null
	);
	const [isLoading, setLoading] = useState(false);
	const [isLoaded, setLoaded] = useState(false);
	async function onChange(event: React.SyntheticEvent, isExpanded: boolean) {
		if (isExpanded) {
			onExpanded(headlineStat.definition.id);
			if (!isLoaded) {
				setLoading(true);
				await fetchDrillDownData(headlineStat.definition).then(setData);
				setLoaded(true);
				setLoading(false);
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
					{data?.[0].metric_value} {headlineStat.definition.unit}
				</Typography>
			</AccordionSummary>
			<AccordionDetails id={`${headlineStat.definition.id}-content`}>
				{hasData(data) ? (
					<List component="ol">
						{data.map((item) => (
							<ListItem disablePadding key={item.visit_date}>
								<ListItemText>
									<StatOutput
										data={item}
										definition={headlineStat.definition}
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
			</AccordionDetails>
		</Accordion>
	);
}
export function StatsAccordion({ data }: { data: HeadlineStat[] | null }) {
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<>
			{data !== null ? (
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
