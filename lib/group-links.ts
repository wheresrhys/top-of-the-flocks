import type { ViewedGroup } from './group-slug';

// Group-scoped summary-page href builders. Pure functions of raw data plus the
// `ViewedGroup` whose slug scopes the route — kept out of app/models/ since
// building a route is a UI/routing concern, not domain data. `undefined`
// (not yet resolved) yields '' rather than throwing, matching the existing
// "empty href renders as plain text" convention used by
// PeriodTotalsTable/createNameLinkCell.

export function buildGroupSummaryHref(
	viewedGroup: ViewedGroup | undefined,
	period: { year: number; month?: number }
): string {
	if (!viewedGroup) {
		return '';
	}
	const suffix =
		period.month === undefined
			? `${period.year}`
			: `${period.year}/${period.month}`;
	return `/group/${viewedGroup.slug}/summary/${suffix}`;
}

export function buildGroupSessionHref(
	viewedGroup: ViewedGroup | undefined,
	date: string
): string {
	if (!viewedGroup) {
		return '';
	}
	return `/group/${viewedGroup.slug}/session/${date}`;
}
