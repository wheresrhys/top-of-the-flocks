import { redirect } from 'next/navigation';
import { getGroupCookie } from '@/app/actions/group-cookie';
import { withGroupScope } from '@/app/components/layout/withGroupScope';
import HomePage from '@/app/(routes)/page';

export default withGroupScope(async ({ viewedGroup }) => {
	const loggedInGroupId = await getGroupCookie();
	if (viewedGroup.id === loggedInGroupId) {
		redirect('/');
	}
	return <HomePage viewedGroup={viewedGroup} />;
});
