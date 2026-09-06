import YearSummaryPage from '@/app/(routes)/summary/[year]/page';
import { withGroupScope } from '@/app/components/layout/withGroupScope';
export default withGroupScope<{ year: string }>(({ viewedGroup, params }) => (
	<YearSummaryPage params={Promise.resolve(params)} viewedGroup={viewedGroup} />
));
