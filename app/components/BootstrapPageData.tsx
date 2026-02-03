import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

export type DefaultPageParams = Record<string, string>;
export type DefaultPageProps = { params: Promise<DefaultPageParams> };

export type BootstrapPageDataProps<DataType, PagePropsType, ParamsType> = {
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

export async function defaultGetParams<
	PagePropsType,
	ParamsType extends Record<string, string>
>(pageProps: PagePropsType): Promise<ParamsType> {
	const rawParams = await (pageProps as DefaultPageProps).params;
	const decodedParams = {} as ParamsType;

	for (const [key, value] of Object.entries(rawParams)) {
		(decodedParams as Record<string, string>)[key] = decodeURIComponent(
			value as string
		);
	}

	return decodedParams;
}

export async function fetchDataWithCache<DataType, ParamsType>(
	params: ParamsType,
	dataFetcher: (params: ParamsType) => Promise<DataType | null>,
	cacheKeys: string[]
): Promise<DataType | null> {
	return unstable_cache(async () => dataFetcher(params), cacheKeys, {
		revalidate: process.env.VERCEL_ENV === 'production' ? 3600 * 24 * 7 : 1, // 7 days in production, 1 second in development
		tags: cacheKeys
	})();
}

export async function LoadWithData<DataType, PagePropsType, ParamsType>({
	pageProps,
	getParams,
	dataFetcher,
	getCacheKeys,
	PageComponent
}: BootstrapPageDataProps<DataType, PagePropsType, ParamsType>) {
	let params: ParamsType;
	if (getParams) {
		params = await getParams(pageProps as PagePropsType);
	} else if (pageProps) {
		params = (await defaultGetParams(pageProps)) as ParamsType;
	} else {
		params = {} as ParamsType;
	}

	const data = await fetchDataWithCache<DataType, ParamsType>(
		params,
		dataFetcher,
		getCacheKeys(params)
	);
	if (!data) {
		notFound();
	}
	return <PageComponent params={params} data={data} />;
}

export function BootstrapPageData<
	DataType,
	PagePropsType = DefaultPageProps,
	ParamsType = DefaultPageParams
>(bootstrapProps: BootstrapPageDataProps<DataType, PagePropsType, ParamsType>) {
	return (
		<Suspense fallback={bootstrapProps.loading || <div>Loading...</div>}>
			<LoadWithData {...bootstrapProps} />
		</Suspense>
	);
}
