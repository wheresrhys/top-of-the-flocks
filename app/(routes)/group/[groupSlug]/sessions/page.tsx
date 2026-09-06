import { withGroupScope } from '@/app/components/layout/withGroupScope';
import SessionsPage from '@/app/(routes)/sessions/page';

export default withGroupScope(({ viewedGroup }) => (
	<SessionsPage viewedGroup={viewedGroup} />
));
