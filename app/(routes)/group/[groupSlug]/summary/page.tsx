import AllTimeSummaryPage from '@/app/(routes)/summary/page';
import { withGroupScope } from '@/app/components/layout/withGroupScope';

export default withGroupScope(({ viewedGroup }) => (
	<AllTimeSummaryPage viewedGroup={viewedGroup} />
));
