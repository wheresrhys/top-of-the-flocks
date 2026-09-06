import YearMonthSummaryPage from '@/app/(routes)/summary/[year]/[month]/page';
import { withGroupScope } from '@/app/components/layout/withGroupScope';
export default withGroupScope<{ year: string; month: string }>(
	({ viewedGroup, params }) => (
		<YearMonthSummaryPage
			params={Promise.resolve(params)}
			viewedGroup={viewedGroup}
		/>
	)
);
