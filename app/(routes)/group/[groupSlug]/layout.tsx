import { redirect } from 'next/navigation';
import { getGroupCookie } from '@/app/actions/group-cookie';
import {
	resolveGroupIdBySlug,
	resolveGroupPublicAreas
} from '@/lib/group-slug';
import { getRequestPathname } from '@/lib/request-pathname';

// Matches a request pathname that falls inside `/group/<slug>/summary`,
// `/group/<slug>/summary/<year>`, or `/group/<slug>/summary/<year>/<month>`
// — the only subtree a group can currently publish (`public_areas` only
// allows `'summary'`, #768). Every other route under `/group/<slug>/**`
// keeps requiring a session cookie regardless of the target group's
// public_areas (#770's "out of scope: any area other than summary").
const SUMMARY_SUBTREE_PATTERN = /^\/group\/[^/]+\/summary(\/|$)/;

export default async function CrossGroupLayout({
	children,
	params
}: {
	children: React.ReactNode;
	params: Promise<{ groupSlug: string }>;
}) {
	const loggedInGroupId = await getGroupCookie();

	if (loggedInGroupId) {
		// Cross-group access control beyond "has some session cookie" (RLS via
		// GroupDataSharing grants, and the summary read-path's own access model)
		// happens at the data layer — see lib/group-summary-access.ts (#770).
		return children;
	}

	const pathname = await getRequestPathname();
	if (pathname && SUMMARY_SUBTREE_PATTERN.test(pathname)) {
		const { groupSlug } = await params;
		const viewedGroupId = await resolveGroupIdBySlug(groupSlug);
		const publicAreas = viewedGroupId
			? await resolveGroupPublicAreas(viewedGroupId)
			: [];
		if (publicAreas.includes('summary')) {
			return children;
		}
	}

	redirect('/');
}
