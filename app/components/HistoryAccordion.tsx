'use client';
import { type Session } from '@/app/sessions/page';
import Link from 'next/link';
import formatDate from 'intl-dateformat';
import { Accordion } from '@/app/components/Accordion';

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
		<ol>
			{month.map((session) => (
				<li key={session.id}>
					<Link className="link" href={`/session/${session.visit_date}`}>
						{session.visit_date}:
					</Link>{' '}
					{session.encounters[0].count} birds
				</li>
			))}
		</ol>
	);
}

function MonthHeading({ model: month }: { model: Session[] }) {
	return (
		<span>
			{formatDate(new Date(month[0].visit_date), 'MMMM YYYY')}, {month.length}{' '}
			sessions,{' '}
			{month
				.flatMap((session) => session.encounters)
				.reduce((acc, encounter) => acc + encounter.count, 0)}{' '}
			birds
		</span>
	);
}

export function HistoryAccordion({ sessions }: { sessions: Session[] | null }) {
	const calendar = groupByYear(sessions || []).map(groupByMonth);
	return (
		<Accordion
			data={calendar.flatMap((year) => year)}
			ContentComponent={SessionsOfMonth}
			HeadingComponent={MonthHeading}
			getKey={(month) => formatDate(new Date(month[0].visit_date), 'YYYY-MM')}
		/>
	);
}
