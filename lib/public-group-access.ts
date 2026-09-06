import {
	resolveGroupIdBySlug,
	resolveGroupPublicAreasForRequest
} from './group-slug';

// Matches `/group/<slug>/summary`, `/group/<slug>/summary/<year>`, or
// `/group/<slug>/summary/<year>/<month>` — the only subtree a group can
// currently publish (`public_areas` only allows `'summary'`, #768). Every
// other route keeps requiring a session cookie regardless of the target
// group's public_areas (#770's "out of scope: any area other than summary").
const PUBLIC_SUMMARY_PATH_PATTERN = /^\/group\/([^/]+)\/summary(\/|$)/;

export async function isPublicGroupPageRequest(
	pathname: string | null
): Promise<boolean> {
	const match = pathname?.match(PUBLIC_SUMMARY_PATH_PATTERN);
	if (!match) {
		return false;
	}

	const viewedGroupId = await resolveGroupIdBySlug(match[1]);
	if (!viewedGroupId) {
		return false;
	}

	const publicAreas = await resolveGroupPublicAreasForRequest(viewedGroupId);
	return publicAreas.includes('summary');
}
