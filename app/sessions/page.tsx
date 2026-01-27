import { fetchAllSessions } from '@/app/sessions/sessions';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import { HistoryAccordion } from '@/app/components/HistoryAccordion';

async function fetchAllSessionsWithCache() {
	return unstable_cache(async () => fetchAllSessions(), ['sessions'], {
		revalidate: 3600 * 24 * 7,
		tags: ['sessions']
	})();
}

async function ListAllSessions() {
	const sessions = await fetchAllSessionsWithCache();
	return (
		<div className="m-5">
			<h1 className="text-base-content text-4xl">All sessions</h1>
			<HistoryAccordion sessions={sessions} />
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
