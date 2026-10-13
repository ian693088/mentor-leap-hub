import { queryOptions } from "@tanstack/react-query";
import { getPublicContent } from "./public.functions";

export const contentQuery = queryOptions({
  queryKey: ["public-content"],
  queryFn: () => getPublicContent(),
  staleTime: 60_000,
});

export type PublicContent = Awaited<ReturnType<typeof getPublicContent>>;
