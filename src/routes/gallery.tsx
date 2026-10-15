import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero } from "@/components/site/SiteHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { galleryQuery } from "@/lib/gallery-queries";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Event Gallery — The Baraka Initiative" },
    { name: "description", content: "Moments from Baraka Initiative events, mentorship and community activities." },
    { property: "og:title", content: "Event Gallery — The Baraka Initiative" },
    { property: "og:description", content: "Our community in pictures." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  component: Gallery,
});
function Gallery() {
  const { data } = useSuspenseQuery(galleryQuery);
  const [event, setEvent] = useState("");
  const events = [...new Set(data.map(p => p.event_name).filter(Boolean))];
  return <><PageHero eyebrow="The Baraka lens" title="Moments that matter" text="The people, connections and shared experiences at the heart of our initiative." /><section className="container-site py-12">{events.length > 0 && <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{data.length} photos</p><label className="flex items-center gap-3 text-sm font-semibold">Event<select className="max-w-56 rounded-md border border-input bg-background p-2" value={event} onChange={e => setEvent(e.target.value)}><option value="">All events</option>{events.map(e => <option key={e}>{e}</option>)}</select></label></div>}<GalleryGrid photos={data.filter(p => !event || p.event_name === event)} /></section></>;
}