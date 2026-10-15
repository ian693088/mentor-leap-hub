import { queryOptions } from "@tanstack/react-query";
import { getGallery } from "./gallery.functions";

export const galleryQuery = queryOptions({ queryKey: ["gallery"], queryFn: () => getGallery(), staleTime: 60_000, refetchInterval: 30 * 60_000 });