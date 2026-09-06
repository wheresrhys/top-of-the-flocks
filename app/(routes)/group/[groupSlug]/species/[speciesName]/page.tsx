import { withGroupScope } from '@/app/components/layout/withGroupScope';
import SpeciesPage from '@/app/(routes)/species/[speciesName]/page';

export default withGroupScope<{ speciesName: string }>(
	({ viewedGroup, params }) => (
		<SpeciesPage
			params={Promise.resolve({ speciesName: params.speciesName })}
			viewedGroup={viewedGroup}
		/>
	)
);
