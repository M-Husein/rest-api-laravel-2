// import { useEffect } from "react";
import { useDocumentTitle } from "@/utils/hooks/useDocumentTitle";
import { HttpError, useInfiniteList } from "@refinedev/core";
import { Card, Button } from 'antd';
// import { useTranslation } from 'react-i18next';
import { getNextPageParam, flatPages } from '@/utils/refine';

interface IArticle {
  id: number | string;
  title: string;
  slug: string;
  desc: string;
  published_at: string;
}

export default function Page(){
  // const ns = "articles";
  // const { t } = useTranslation([ns]);

  const titlePage = "Articles"; // t('title', ns); // , "Contact Us"
  useDocumentTitle(titlePage + " • " + APP.name);

  const {
    result: { data: dataArticles, hasNextPage }, // , hasPreviousPage
    // query: { isError, isLoading, fetchNextPage, isFetchingNextPage },
    query
  } = useInfiniteList<IArticle, HttpError>({
    resource: "articles",
    pagination: {
      pageSize: 2
    },
    meta: {
      mode: "lazy",
      q: "",
    },
    // React Query will generate unique cache keys based on meta
    queryOptions: {
      getNextPageParam,
    },
  });

  // Flatten all pages into a single array
  const articles = flatPages(dataArticles);

  console.log({ dataArticles, hasNextPage, articles });

  return (
    <div className="py-4 px-2 max-w-screen-xl mx-auto">
      <Card 
        title={titlePage}
        loading={query.isLoading} //  || query.isFetching
        className="shadow"
      >
        {/* <p>{t('desc')}</p> */}
        {articles.map((item: IArticle) => 
          <article
            key={item.slug}
          >
            <h1>{item.title}</h1>
            <p>{item.desc}</p>
          </article>
        )}

        {hasNextPage && (
          <Button
            onClick={() => query.fetchNextPage()}
            loading={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? 'Memuat...' : 'More'}
          </Button>
        )}
      </Card>
    </div>
  );
}
