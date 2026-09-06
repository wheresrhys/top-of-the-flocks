import { headers } from 'next/headers';

// Server Components (layouts included) only ever receive `params` for the
// dynamic segments up to and including their own position in the route tree
// — never a deeper segment's static path (e.g. `[groupSlug]/layout.tsx`
// cannot see that a request is for the `summary` subtree beneath it purely
// from its own `params`). `middleware.ts` stamps the real request pathname
// onto this header on every `/group/**` request so a shared layout can still
// make a subtree-specific decision.
export const REQUEST_PATHNAME_HEADER = 'x-pathname';

export async function getRequestPathname(): Promise<string | null> {
	const headerList = await headers();
	return headerList.get(REQUEST_PATHNAME_HEADER);
}
