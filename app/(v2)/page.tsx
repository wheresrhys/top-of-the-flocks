"use client"
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import type { TopPeriodsResult } from '@/types/graphql.types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import formatDate from 'intl-dateformat';


type TemporalUnit = 'day' | 'month' | 'year';

type PanelDefinition = {
	id: string;
	category: string;
	unit: string;
	temporalUnit?: TemporalUnit;
}
type HeadlineStat = {
	definition: PanelDefinition;
	data: TopPeriodsResult;
}

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
}: HeadlineStat & { showUnit: boolean }) {
	return (
		<Typography variant="body2">
			<b>{data.metricValue}{showUnit ? ` ${definition.unit}` : ''}</b> {connectingVerbMap[definition.temporalUnit]}{' '}
			{formatDate(
				new Date(data.visitDate as string),
				dateFormatMap[definition.temporalUnit as TemporalUnit]
			)}
		</Typography>
	);
}

function AccordionItem({ headlineStat, onExpanded, expandedId }: { headlineStat: HeadlineStat, onExpanded: (id: string) => void, expandedId: string }) {
	function onChange(event: React.SyntheticEvent, isExpanded: boolean) {
		if (isExpanded) {
			onExpanded(headlineStat.definition.id);
		}
	}
	return (
		<Accordion onChange={onChange} expanded={expandedId === headlineStat.definition.id}>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls={`${headlineStat.definition.id}-content`}
				id={`${headlineStat.definition.id}-header`}
			>
					<Typography component="span" sx={{
						fontWeight: 700,
					}}>{headlineStat.definition.category}:</Typography>
				<Typography component="span">{headlineStat.data.metricValue}</Typography>
			</AccordionSummary>
			<AccordionDetails id={`${headlineStat.definition.id}-content`}>
				<List component="ol">
					<ListItem disablePadding>
						<ListItemText>
							<StatOutput {...headlineStat} showUnit={true} />
						</ListItemText>
					</ListItem>
				</List>
			</AccordionDetails>
		</Accordion>
	);
}

const panelDefinitions: PanelDefinition[] = [
	{
		id: 'busiest-session-ever',
		category: 'Busiest session ever',
		unit: 'Birds',
		temporalUnit: 'day',
	},
	{
		id: 'most-varied-session-ever',
		category: 'Most varied session ever',
		unit: 'Species',
		temporalUnit: 'day',
	},
	{
		id: 'busiest-winter-session-ever',
		category: 'Busiest winter session ever',
		unit: 'Birds',
		temporalUnit: 'day',
	},
	{
		id: 'most-of-one-species-ever',
		category: 'Most of one species in a day ever',
		unit: 'Birds',
		temporalUnit: 'day',
	},
	{
		id: 'best-month-ever',
		category: 'Best month ever',
		unit: 'Birds',
		temporalUnit: 'month',
	},
	{
		id: 'Busiest-session-this-winter',
		category: 'Busiest session this winter',
		unit: 'Birds',
		temporalUnit: 'day',
	},
	{
		id: 'most-varied-session-this-winter',
		category: 'Most varied session this winter',
		unit: 'Species',
		temporalUnit: 'day',
	},

]

function fetchInitialData (panels: PanelDefinition[]): HeadlineStat[] {
	return panels.map((panel) => ({
		definition: panel,
		data: {
			metricValue: 100,
			visitDate: '2026-01-01',
		}
	}))
}

export default function Home() {
	const [expanded, setExpanded] = useState<string | false>(false);

	return <div>

		{fetchInitialData(panelDefinitions).map((item) => (
				<AccordionItem key={item.id} headlineStat={item} onExpanded={(id) => setExpanded(id)} expandedId={expanded} />
			))}
	</div>;
}









