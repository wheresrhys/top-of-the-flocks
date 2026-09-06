import { withGroupScope } from '@/app/components/layout/withGroupScope';
import PulliPage from '@/app/(routes)/pulli/page';

export default withGroupScope(({ viewedGroup }) => (
	<PulliPage viewedGroup={viewedGroup} />
));
