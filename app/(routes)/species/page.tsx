import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import type { Database } from '@/types/supabase.types';
import Link from 'next/link';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import { Table } from '@/app/components/DesignSystem';
type SpeciesLeagueTableRow =
	Database['public']['Views']['species_league_table']['Row'];

export async function fetchSpeciesData(): Promise<SpeciesLeagueTableRow[]> {
	return supabase
		.from('species_league_table')
		.select(
			`
		species_name,
		individuals,
		encounters,
		session_count,
		longest_stay,
		unluckiest,
		longest_winged,
		average_wing_length,
		shortest_winged,
		heaviest,
		average_weight,
		lightest,
		total_weight
	`
		)
		.order('encounters', { ascending: false })
		.then(catchSupabaseErrors) as Promise<SpeciesLeagueTableRow[]>;
}

function SpeciesLeagueTable({ data }: { data: SpeciesLeagueTableRow[] }) {
	return (
		<Table>
			<thead>
				<tr>
					<th className="text-wrap">Species</th>
					<th className="text-wrap">
						<span className="hidden md:inline">Individuals</span>
						<span className="inline md:hidden">Inds</span>
					</th>
					<th className="text-wrap">
						<span className="hidden md:inline">Encounters</span>
						<span className="inline md:hidden">Encs</span>
					</th>
					<th className="text-wrap">
						<span className="hidden md:inline">Sessions</span>
						<span className="inline md:hidden">Sess</span>
					</th>
					<th className="text-wrap">Max retraps</th>
					<th className="text-wrap">Max Wing</th>
					<th className="text-wrap">Avg Wing</th>
					<th className="text-wrap">Min Wing</th>
					<th className="text-wrap">Max Weight</th>
					<th className="text-wrap">Avg Weight</th>
					<th className="text-wrap">Min Weight</th>
				</tr>
			</thead>
			<tbody>
				{data.map((species) => (
					<tr key={species.species_name}>
						<td>
							<Link
								className="link text-wrap"
								href={`/species/${species.species_name}`}
							>
								{species.species_name}
							</Link>
						</td>
						<td>{species.individuals}</td>
						<td>{species.encounters}</td>
						<td>{species.session_count}</td>
						<td>{species.unluckiest}</td>
						<td>{species.longest_winged}</td>
						<td>{species.average_wing_length?.toFixed(1)}</td>
						<td>{species.shortest_winged}</td>
						<td>{species.heaviest}</td>
						<td>{species.average_weight?.toFixed(1)}</td>
						<td>{species.lightest}</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default async function AllSpeciesPage() {
	return (
		<BootstrapPageData<SpeciesLeagueTableRow[]>
			getCacheKeys={() => ['species']}
			dataFetcher={fetchSpeciesData}
			PageComponent={SpeciesLeagueTable}
		/>
	);
}
