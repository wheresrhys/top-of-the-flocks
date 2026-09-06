import { notFound } from 'next/navigation';
import { resolveGroupIdBySlug } from '@/lib/group-slug';
import AllTimeSummaryPage from '@/app/(routes)/summary/page';

export default async function GroupSummaryPage({
	params
}: {
	params: Promise<{ groupSlug: string }>;
}) {
	const { groupSlug } = await params;
	const viewedGroupId = await resolveGroupIdBySlug(groupSlug);
	if (viewedGroupId === null) {
		notFound();
	}
	const viewedGroup = { id: viewedGroupId, slug: groupSlug };
	return <AllTimeSummaryPage viewedGroup={viewedGroup} />;
}
