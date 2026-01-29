import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';


type DefaultPageParams = {}
type DefaultPageProps = { params: Promise<DefaultPageParams> }

type BootstrapPageDataProps<DataType, PagePropsType, ParamsType> = {
	pageProps?: PagePropsType;
	loading?: React.ReactNode;
  getCacheKeys: (params: ParamsType) => string[];
	getParams?: (pageProps: PagePropsType) => Promise<ParamsType>;
  dataFetcher: (params: ParamsType) => Promise<DataType | null>;
	PageComponent: (props: {
    params: ParamsType;
		data: DataType;
	}) => React.ReactNode;
};

async function getParams<PagePropsType, ParamsType>(pageProps: PagePropsType): Promise<ParamsType> {
	return (pageProps as DefaultPageProps).params as ParamsType;
}

async function fetchDataWithCache<DataType, ParamsType>(
  params: ParamsType,
  dataFetcher: (params: ParamsType) => Promise<DataType | null>,
	cacheKeys: string[]
): Promise<DataType | null> {
	return unstable_cache(async () => dataFetcher(params), cacheKeys, {
		revalidate: process.env.VERCEL_ENV === 'production' ? 3600 * 24 * 7 : 1, // 7 days in production, 1 second in development
		tags: cacheKeys
	})();
}

async function LoadWithData<DataType, PagePropsType, ParamsType>(
	bootstrapProps: BootstrapPageDataProps<DataType, PagePropsType, ParamsType>
) {
	const params = (bootstrapProps.getParams ? await bootstrapProps.getParams(bootstrapProps.pageProps as PagePropsType) : await getParams(bootstrapProps.pageProps as DefaultPageProps)) as ParamsType;
	const data = await fetchDataWithCache<DataType, ParamsType>(
		params,
		bootstrapProps.dataFetcher,
		bootstrapProps.getCacheKeys(params)
	);
	if (!data) {
		notFound();
	}
	return <bootstrapProps.PageComponent params={params} data={data} />;
}

export function BootstrapPageData<DataType, PagePropsType = DefaultPageProps, ParamsType = DefaultPageParams>(
	bootstrapProps: BootstrapPageDataProps<DataType, PagePropsType, ParamsType>
) {
	return (
		<Suspense fallback={bootstrapProps.loading || <div>Loading...</div>}>
			<LoadWithData {...bootstrapProps} />
		</Suspense>
	);
}
