import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

type BootstrapPageDataProps<DataType, PagePropsType = unknown> = {
  pageProps: PagePropsType;
  loading: React.ReactNode;
  cacheKeys: string[];
  generateParams: (pageProps: PagePropsType) => Promise<Record<string, unknown>>;
  dataFetcher: (params: Record<string, unknown>) => Promise<DataType>;
  PageComponent: (props: { params: Record<string, unknown>, data: DataType }) => React.ReactNode;
}

async function fetchDataWithCache<DataType>(
  params: Record<string, unknown>,
  dataFetcher: (params: Record<string, unknown>) => Promise<DataType>,
  cacheKeys: string[]
): Promise<DataType | null> {
  return unstable_cache(
    async () => dataFetcher(params),
    cacheKeys,
    {
      revalidate: 3600 * 24 * 7,
      tags: cacheKeys
    }
  )();
}

async function LoadWithData<DataType>(bootstrapProps: BootstrapPageDataProps<DataType>) {
  const params = await bootstrapProps.generateParams(bootstrapProps.pageProps)
  const data = await fetchDataWithCache<DataType>(params, bootstrapProps.dataFetcher, bootstrapProps.cacheKeys);
  if (!data) {
    notFound();
  }
  return <bootstrapProps.PageComponent params={params} data={data} />;
}

export function BootstrapPageData<DataType>(bootstrapProps: BootstrapPageDataProps<DataType>) {
  return (
    <Suspense fallback={bootstrapProps.loading || <div>Loading...</div>}>
      <LoadWithData {...bootstrapProps} />
    </Suspense>
  );
}
