import { Suspense } from 'react';
import { graphqlRequest, type GraphQLResponse } from '@/lib/graphql-client';
import gql from 'graphql-tag';
import { unstable_cache } from 'next/cache';
import { GetSessionByDateQuery } from '@/types/graphql.types';
import { notFound } from 'next/navigation';

const GET_SESSION_BY_DATE = gql`
	query GetSessionByDate($date: Date) {
		sessions(where: { visitDate: { _eq: $date } }) {
			encounters {
				age
				captureTime
				isJuv
				recordType
				sex
				weight
				wingLength
				bird {
					ringNo
					species {
						speciesName
					}
				}
			}
		}
	}
`;

async function fetchSessionByDate(date: string) {
	const { data }: GraphQLResponse<GetSessionByDateQuery> =
		await graphqlRequest<GetSessionByDateQuery>(GET_SESSION_BY_DATE, { date });
	console.log('daaa', data);
	if (!data) {
		throw new Error('Failed to fetch data');
	}
	return data?.sessions?.[0];
}

async function fetchInitialDataWithCache(date: string) {
	return unstable_cache(
		async () => fetchSessionByDate(date),
		['session', date],
		{
			revalidate: 3600 * 24 * 7,
			tags: ['session', date]
		}
	)();
}

async function DisplayInitialData({
	paramsPromise
}: {
	paramsPromise: Promise<{ date: string }>;
}) {
	const { date } = await paramsPromise;
	const initialData = await fetchInitialDataWithCache(date);
	if (!initialData) {
		notFound();
	}
	return (
		<div>
			Session on {date} - {initialData?.encounters?.length} birds
		</div>
	);
}

export default async function SessionPage({
	params: paramsPromise
}: {
	params: Promise<{ date: string }>;
}) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DisplayInitialData paramsPromise={paramsPromise} />
		</Suspense>
	);
}
