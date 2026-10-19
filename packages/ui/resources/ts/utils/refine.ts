type getNextPageParamResult = number | { cursor: string } | undefined; // Record<string, any>

/**
 * 
 * @param lastPage 
 * @param allPages 
 * @returns number | { cursor: string } | undefined
 */
export const getNextPageParam = (lastPage: any, allPages: any): getNextPageParamResult => {
  // console.log('lastPage:', lastPage);
  // console.log('allPages:', allPages);

  const nextCursor = lastPage.meta?.nextCursor;
  if(nextCursor){
    return { cursor: nextCursor };
  }

  if(lastPage.meta?.more){
    return allPages.length + 1;
  }
};

/**
 * Flattens paginated data from React Query's `useInfiniteQuery`.
 * Merges `page.data` from each page into a single flat array.
 *
 * @template T - The type of a single item in the data array.
 * @param data - The `data` object returned from `useInfiniteQuery`.
 * @returns A flat array of all items across all pages, or `[]` if undefined.
 */
export const flatPages = <T>(
  data: { pages?: Array<{ data?: T[] }> } | undefined
): T[] => 
  data?.pages?.flatMap(page => page?.data ?? []) ?? [];
