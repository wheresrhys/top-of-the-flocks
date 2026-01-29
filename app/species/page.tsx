import {BootstrapPageData} from '@/app/components/BootstrapPageData';
import {querySupabaseForTable} from '@/app/lib/supabase-query';
import type { Database } from '@/types/supabase.types';
import Link from 'next/link';
type SpeciesLeagueTableRow = Database['public']['Views']['species_league_table']['Row'];

export async function fetchSpeciesData(): Promise<SpeciesLeagueTableRow[]> {
	return querySupabaseForTable<SpeciesLeagueTableRow>({
		rootTable: 'species_league_table',
		orderByField: 'encounters',
		orderByDirection: 'desc',
		query: `
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
	})
}

function SpeciesLeagueTable({ data }: { data: SpeciesLeagueTableRow[]}) {
	return <div className="w-full overflow-x-auto h-fit"><table className="table">
		<thead>
			<tr>
				<th>Species</th>
				<th>Individuals</th>
				<th>Encounters</th>
				<th>Session Count</th>
				<th>Longest Stay</th>
				<th>Unluckiest</th>
				<th>Longest Winged</th>
				<th>Average Wing Length</th>
				<th>Shortest Winged</th>
				<th>Heaviest</th>
				<th>Average Weight</th>
				<th>Lightest</th>
				<th>Total Weight</th>
			</tr>
		</thead>
		<tbody>
			{data.map((species) => (
				<tr key={species.species_name}>
					<td><Link className="link link-primary" href={`/species/${species.species_name}`}>{species.species_name}</Link></td>
					<td>{species.individuals}</td>
					<td>{species.encounters}</td>
					<td>{species.session_count}</td>
					<td>{species.longest_stay}</td>
					<td>{species.unluckiest}</td>
					<td>{species.longest_winged}</td>
					<td>{species.average_wing_length}</td>
					<td>{species.shortest_winged}</td>
					<td>{species.heaviest}</td>
					<td>{species.average_weight}</td>
					<td>{species.lightest}</td>
					<td>{species.total_weight}</td>
				</tr>
			))}
		</tbody>
	</table>
	</div>
}

export default async function AllSpeciesPage() {
	return (<BootstrapPageData<SpeciesLeagueTableRow[]>
		getCacheKeys={() => ['species']}
		dataFetcher={fetchSpeciesData}
		PageComponent={SpeciesLeagueTable}
	/>)
}
