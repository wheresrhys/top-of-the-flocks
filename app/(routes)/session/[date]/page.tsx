import {
	SessionTable,
	type SpeciesBreakdown
} from '@/app/components/SessionTable';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';
import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import {
	BadgeList,
	PageWrapper,
	PrimaryHeading
} from '@/app/components/DesignSystem';
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

function groupBySpecies(encounters: Encounter[]): SpeciesBreakdown[] {
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
				return a.species.localeCompare(b.species);
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
	const speciesBreakdown = groupBySpecies(session);

	return (
		<PageWrapper>
			<PrimaryHeading>
				{formatDate(new Date(date), 'EEE do MMMM yyyy')}
			</PrimaryHeading>
			<BadgeList
				testId="session-stats"
				items={[
					`${session.length} birds`,
					`${speciesBreakdown.length} species`,
					`${session.filter((encounter) => encounter.record_type === 'N').length} new`,
					`${session.filter((encounter) => encounter.record_type === 'S').length} retraps`,
					`${session.filter((encounter) => encounter.minimum_years >= 1).length} adults`,
					`${session.filter((encounter) => encounter.minimum_years === 0).length} juvs`
				]}
			/>
			<SessionTable speciesBreakdown={speciesBreakdown} />
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
