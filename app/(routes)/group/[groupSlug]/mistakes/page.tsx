import { withGroupScope } from '@/app/components/layout/withGroupScope';
import MistakesPage from '@/app/(routes)/mistakes/page';

export default withGroupScope(({ viewedGroup }) => (
	<MistakesPage viewedGroup={viewedGroup} />
));
