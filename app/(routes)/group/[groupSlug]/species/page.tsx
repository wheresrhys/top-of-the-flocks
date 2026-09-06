import { withGroupScope } from '@/app/components/layout/withGroupScope';
import AllSpeciesPage from '@/app/(routes)/species/page';

export default withGroupScope(({ viewedGroup }) => (
	<AllSpeciesPage viewedGroup={viewedGroup} />
));
