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


type TemporalUnit = 'day' | 'month' | 'year';

type HeadlineStat = {
	temporalUnit: TemporalUnit;
} & TopPeriodsResult;

function AccordionItem({ id, category, stat, onExpanded, expandedId }: { id: string, category: string, stat: HeadlineStat, onExpanded: (id: string) => void, expandedId: string }) {
	function onChange(event: React.SyntheticEvent, isExpanded: boolean) {
		if (isExpanded) {
			onExpanded(id);
		}
	}
	return (
		<Accordion onChange={onChange} expanded={expandedId === id}>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls={`${id}-content`}
				id={`${id}-header`}
			>
					<Typography component="span" sx={{
						fontWeight: 700,
					}}>{category}:</Typography>
				<Typography component="span">{stat.metricValue}</Typography>
			</AccordionSummary>
			<AccordionDetails id={`${id}-content`}>
				<List component="ol">
					<ListItem disablePadding>
						<ListItemText>
							{stat.metricValue} on {stat.visitDate}
						</ListItemText>
					</ListItem>
				</List>
			</AccordionDetails>
		</Accordion>
	);
}
const staticData = [
	{
		id: 'total-visits',
		category: 'Total visits',
		stat: {
			metricValue: 100,
			temporalUnit: 'year'
		}
	},
	{
		id: 'total-visits2',
		category: 'Total visits 2',
		stat: {
			metricValue: 100,
			temporalUnit: 'year'
		}
	}
]
export default function Home() {
	const [expanded, setExpanded] = useState<string | false>(false);

	return <div>

			{staticData.map((item) => (
				<AccordionItem key={item.id} id={item.id} category={item.category} stat={item.stat} onExpanded={(id) => setExpanded(id)} expandedId={expanded} />
			))}
	</div>;
}









