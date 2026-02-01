'use client';
import { type Session } from '@/app/(routes)/sessions/page';
import { AccordionItem } from '@/app/components/Accordion';
import { BoxyList, SecondaryHeading } from '@/app/components/DesignSystem';
import { useState, useEffect } from 'react';
import { StatOutput } from './StatOutput';
import { format as formatDate } from 'date-fns';
function groupByDateMethod(methodName: 'getFullYear' | 'getMonth') {
	return function (sessions: Session[] | null): Session[][] {
		if (!sessions) return [];
		return Object.entries(
			sessions.reduce((acc: Record<string, Session[]>, session) => {
				const date = new Date(session.visit_date);
				const groupByValue = String(date[methodName]());
				acc[groupByValue] = acc[groupByValue] || [];
				acc[groupByValue].push(session);
				return acc;
			}, {})
		)
			.map(([groupByValue, sessions]) => ({ groupByValue, sessions }))
			.sort((a, b) => {
				if (a.groupByValue === b.groupByValue) return 0;
				return Number(a.groupByValue) > Number(b.groupByValue) ? -1 : 1;
			})
			.map(({ sessions }) => sessions) as Session[][];
	};
}

const groupByYear = groupByDateMethod('getFullYear');
const groupByMonth = groupByDateMethod('getMonth');

function SessionsOfMonth({ model: month }: { model: Session[] }) {
	return (
		<ol className="list-inside list-none">
			{month.map((session) => (
				<li className="mb-2" key={session.id}>
					<StatOutput
						unit="birds"
						value={session.encounters[0].count}
						speciesName={''}
						visitDate={session.visit_date}
						showUnit={true}
						temporalUnit="day"
						dateFormat="EEEE do"
					/>
				</li>
			))}
		</ol>
	);
}

function MonthHeading({ model: month }: { model: Session[] }) {
	return (
		<span>
			<span className="font-bold">
				{formatDate(new Date(month[0].visit_date), 'MMMM')}:
			</span>{' '}
			{month.length} sessions,{' '}
			{month
				.flatMap((session) => session.encounters)
				.reduce((acc, encounter) => acc + encounter.count, 0)}{' '}
			birds
		</span>
	);
}

export function HistoryAccordion({ sessions }: { sessions: Session[] | null }) {
	const calendar = groupByYear(sessions || []).map(groupByMonth);
	const [expanded, setExpanded] = useState<string | false>(false);
	useEffect(() => {
		setExpanded(false);
	}, []);
	return (
		<>
			{calendar.map((year) => {
				const yearString = new Date(year[0][0].visit_date).getFullYear();
				return (
					<div key={yearString}>
						<SecondaryHeading>{yearString}</SecondaryHeading>
						<BoxyList>
							{year.map((month) => {
								const id = formatDate(new Date(month[0].visit_date), 'yyyy-MM');
								return (
									<AccordionItem
										key={id}
										id={id}
										HeadingComponent={MonthHeading}
										ContentComponent={SessionsOfMonth}
										model={month}
										onToggle={setExpanded}
										expandedId={expanded}
									/>
								);
							})}
						</BoxyList>
					</div>
				);
			})}
		</>
	);
}
