import { BootstrapPage } from '@/app/components/layout/BootstrapPage';
import { withGroupScope } from '@/app/components/layout/withGroupScope';
import { fetchSessionPageContent } from '../../page';
import {
	SessionPageContent,
	type DayData,
	type PageParams
} from '../../PageContent';

type PageProps = {
	params: Promise<{ groupSlug: string; date: string; locationId: string }>;
};

export default withGroupScope<{ date: string; locationId: string }>(
	({ viewedGroup, params }) => (
		<BootstrapPage<DayData, PageProps, PageParams>
			viewedGroup={viewedGroup}
			getParams={async () => ({
				viewedGroupId: viewedGroup.id,
				date: params.date,
				locationId: Number(params.locationId)
			})}
			getCacheKeys={() => ['session', params.date, `loc-${params.locationId}`]}
			dataFetcher={fetchSessionPageContent}
			PageComponent={SessionPageContent}
			ttl={3600 * 24 * 7}
		/>
	)
);
