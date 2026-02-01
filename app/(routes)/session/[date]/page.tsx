import {
	SessionTable,
	type SpeciesBreakdown
} from '@/app/components/SessionTable';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';
import { format as formatDate } from 'date-fns';

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
	const data = (await supabase
		.from('Sessions')
		.select(
			`
		id,
		encounters:Encounters(
			id,
			session_id,
			age_code,
			minimum_years,
			capture_time,
			record_type,
			sex,
			weight,
			wing_length,
			bird:Birds (
				ring_no,
				species:Species (
					id,
					species_name
				)
			)
		)
	`
		)
		.eq('visit_date', date)
		.maybeSingle()
		.then(catchSupabaseErrors)) as {
		id: number;
		encounters: Encounter[];
	} | null;
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
		<PageWrapper>
			<PrimaryHeading>
				{formatDate(new Date(date), 'EEE do MMMM yyyy')}
			</PrimaryHeading>
			<ul className="flex flex-wrap gap-2">
				<li className="badge badge-secondary">{session.length} birds</li>
				<li className="badge badge-secondary">
					{speciesBreakdown.length} species
				</li>
				<li className="badge badge-secondary">
					{session.filter((encounter) => encounter.record_type === 'N').length}{' '}
					new
				</li>
				<li className="badge badge-secondary">
					{session.filter((encounter) => encounter.record_type === 'S').length}{' '}
					retraps
				</li>
				<li className="badge badge-secondary">
					{session.filter((encounter) => encounter.minimum_years >= 1).length}{' '}
					adults
				</li>
				<li className="badge badge-secondary">
					{session.filter((encounter) => encounter.minimum_years === 0).length}{' '}
					juvs
				</li>
			</ul>
			<SessionTable date={date} speciesBreakdown={speciesBreakdown} />
		</PageWrapper>
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
