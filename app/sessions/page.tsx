import { fetchAllSessions } from '@/app/api/sessions';
import { type Session } from '@/app/api/sessions';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import formatDate from 'intl-dateformat';

function groupByDateMethod(methodName: string) {
	return function (sessions: Session[] | null): Session[][] {
		if (!sessions) return [];
		return Object.entries(
			sessions.reduce((acc: Record<string, Session[]>, session) => {
				const date = new Date(session.visit_date);
				const groupByValue = String(date[methodName as keyof Date]());
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

async function fetchAllSessionsWithCache() {
	return unstable_cache(async () => fetchAllSessions(), ['sessions'], {
		revalidate: 3600 * 24 * 7,
		tags: ['sessions']
	})();
}

async function ListAllSessions() {
	const sessions = await fetchAllSessionsWithCache();
	const calendar = groupByYear(sessions || []).map(groupByMonth);
	return (
		<div className="m-5">
			<h1 className="text-base-content text-4xl">All sessions</h1>
			<ol className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
				{calendar.flatMap((year) =>
					year.flatMap((month) => (
						<li key={formatDate(new Date(month[0].visit_date), 'YYYY-MM')}>
							{formatDate(new Date(month[0].visit_date), 'MMMM YYYY')}
							<ol>
								{month.flatMap((session) => (
									<li key={session.id}>
										<Link
											className="link"
											href={`/session/${session.visit_date}`}
										>
											{session.visit_date}:
										</Link>{' '}
										{session.encounters[0].count} birds
									</li>
								))}
							</ol>
						</li>
					))
				)}
			</ol>
		</div>
	);
}

export default async function SessionsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ListAllSessions />
		</Suspense>
	);
}
