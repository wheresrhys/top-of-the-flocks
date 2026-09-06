import { notFound } from 'next/navigation';
import { resolveGroupIdBySlug } from '@/lib/group-slug';
import YearSummaryPage from '@/app/(routes)/summary/[year]/page';

export default async function GroupSummaryYearPage({
	params
}: {
	params: Promise<{ groupSlug: string; year: string }>;
}) {
	const { groupSlug, year } = await params;
	const viewedGroupId = await resolveGroupIdBySlug(groupSlug);
	if (viewedGroupId === null) {
		notFound();
	}
	const viewedGroup = { id: viewedGroupId, slug: groupSlug };
	return (
		<YearSummaryPage
			params={Promise.resolve({ year })}
			viewedGroup={viewedGroup}
		/>
	);
}
