import { HistoryAccordion } from '@/app/components/HistoryAccordion';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { querySupabaseForTable } from '@/app/lib/supabase-query';

export type Session = {
	id: number;
	visit_date: string;
	encounters: { count: number }[];
};

export type SessionWithEncounters = Session & {
	encounters: { count: number }[];
};

export async function fetchAllSessions(): Promise<Session[] | null> {
	return querySupabaseForTable({
		rootTable: 'Sessions',
		query: 'id, visit_date, encounters:Encounters(count)',
		orderByField: 'visit_date',
		orderByDirection: 'desc'
	});
}

async function ListAllSessions({ data }: { data: Session[] }) {
	return (
		<div className="m-5">
			<h1 className="text-base-content text-4xl">All sessions</h1>
			<HistoryAccordion sessions={data} />
		</div>
	);
}

export default async function SessionsPage() {
	return (
		<BootstrapPageData<Session[]>
			getCacheKeys={() => ['sessions']}
			dataFetcher={fetchAllSessions}
			PageComponent={ListAllSessions}
		/>
	);
}
