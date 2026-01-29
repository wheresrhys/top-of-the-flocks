import {
	SessionTable,
	type SpeciesBreakdown
} from '@/app/components/SessionTable';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';

type PageParams = { date: string };
type PageProps = { params: Promise<PageParams> };

export type Encounter = Database['public']['Tables']['Encounters']['Row'] & {
	bird: {
		ring_no: string;
		species: { species_name: string };
	};
};

async function fetchSessionData({
	date
}: PageParams): Promise<Encounter[] | null> {
	const data = await supabase
	.from('Sessions')
	.select(`
		id,
		encounters:Encounters(
			id,
			session_id,
			age,
			bird_id,
			capture_time,
			is_juv,
			record_type,
			sex,
			weight,
			wing_length,
			breeding_condition,
			extra_text,
			moult_code,
			old_greater_coverts,
			scheme,
			sexing_method,
			bird:Birds (
				id,
				species_id,
				ring_no,
				species:Species (
					id,
					species_name
				)
			)
		)
	`)
	.eq('visit_date', date)
	.maybeSingle()
	.then(catchSupabaseErrors) as ({
		id: number
		encounters: Encounter[]
	} | null);
	if (!data) {
		return null;
	}
	return data.encounters;
}

function getSpeciesBreakdown(encounters: Encounter[]): SpeciesBreakdown {
	const map: Record<string, Encounter[]> = {};
	encounters.forEach((encounter) => {
		const species = encounter.bird.species.species_name;
		map[species] = map[species] || [];
		map[species].push(encounter);
	});
	return Object.entries(map)
		.map(([species, encounters]) => ({ species, encounters }))
		.sort((a, b) => {
			if (a.encounters.length === b.encounters.length) {
				return 0;
			}
			return a.encounters.length < b.encounters.length ? 1 : -1;
		});
}

function SessionSummary({
	data: session,
	params: { date }
}: {
	data: Encounter[];
	params: { date: string };
}) {
	const speciesBreakdown = getSpeciesBreakdown(session);

	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">Session on {date}</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					<li>{session.length} birds</li>
					<li>{speciesBreakdown.length} species</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'N')
								.length
						}{' '}
						new
					</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'S')
								.length
						}{' '}
						retraps
					</li>
					<li>
						{session.filter((encounter) => !encounter.is_juv).length} adults
						[FIX ME!]
					</li>
					<li>
						{session.filter((encounter) => encounter.is_juv).length} juvs [FIX
						ME!]
					</li>
				</ul>
			</div>
			<SessionTable date={date} speciesBreakdown={speciesBreakdown} />
		</div>
	);
}

export default async function SessionPage(props: PageProps) {
	return (
		<BootstrapPageData<Encounter[], PageProps, PageParams>
			pageProps={props}
			getCacheKeys={(params) => ['session', params.date as string]}
			dataFetcher={fetchSessionData}
			PageComponent={SessionSummary}
		/>
	);
}
