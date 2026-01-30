import { HistoryAccordion } from '@/app/components/HistoryAccordion';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';

export type Session = {
	id: number;
	visit_date: string;
	encounters: { count: number }[];
};

export type SessionWithEncounters = Session & {
	encounters: { count: number }[];
};

export async function fetchAllSessions(): Promise<Session[]> {
	return supabase
		.from('Sessions')
		.select('id, visit_date, encounters:Encounters(count)')
		.order('visit_date', { ascending: false })
		.then(catchSupabaseErrors) as Promise<Session[]>;
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
