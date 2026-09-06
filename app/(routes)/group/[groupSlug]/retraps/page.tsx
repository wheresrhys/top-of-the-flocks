import { withGroupScope } from '@/app/components/layout/withGroupScope';
import RetrapsPage from '@/app/(routes)/retraps/page';

export default withGroupScope(({ viewedGroup }) => (
	<RetrapsPage viewedGroup={viewedGroup} />
));
