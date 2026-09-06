import { notFound } from 'next/navigation';
import { resolveGroupIdBySlug } from '@/lib/group-slug';
import YearMonthSummaryPage from '@/app/(routes)/summary/[year]/[month]/page';

export default async function GroupSummaryYearMonthPage({
	params
}: {
	params: Promise<{ groupSlug: string; year: string; month: string }>;
}) {
	const { groupSlug, year, month } = await params;
	const viewedGroupId = await resolveGroupIdBySlug(groupSlug);
	if (viewedGroupId === null) {
		notFound();
	}
	const viewedGroup = { id: viewedGroupId, slug: groupSlug };
	return (
		<YearMonthSummaryPage
			params={Promise.resolve({ year, month })}
			viewedGroup={viewedGroup}
		/>
	);
}
