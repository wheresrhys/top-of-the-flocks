import { withGroupScope } from '@/app/components/layout/withGroupScope';
import EffortPage from '@/app/(routes)/effort/page';

export default withGroupScope(({ viewedGroup }) => (
	<EffortPage viewedGroup={viewedGroup} />
));
