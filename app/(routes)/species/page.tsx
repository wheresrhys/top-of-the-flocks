import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { MultiSpeciesStatsTable } from '@/app/components/MultiSpeciesStatsTable';
import {
	fetchSpeciesData,
	type SpeciesStatsRow
} from '@/app/isomorphic/multi-species-data';

export default async function AllSpeciesPage() {
	return (
		<BootstrapPageData<SpeciesStatsRow[]>
			getCacheKeys={() => ['species']}
			dataFetcher={fetchSpeciesData}
			PageComponent={MultiSpeciesStatsTable}
		/>
	);
}
