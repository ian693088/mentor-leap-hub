import { useState } from "react";
import { Camera, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDate } from "@/lib/site";

type Photo = { id: string; title: string; event_name: string; event_date: string | null; caption: string; url: string };
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? undefined : photos[selected];
  if (!photos.length) return <div className="border-y border-border py-16 text-center"><Camera className="mx-auto size-10 text-primary" /><h2 className="mt-4 text-2xl font-bold">Our next chapter, in pictures</h2><p className="mt-2 text-muted-foreground">Event photos will appear here soon.</p></div>;
  return <>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{photos.map((p, i) => <article key={p.id} className="group overflow-hidden rounded-lg border border-border bg-card">
      <Button variant="ghost" className="block h-auto w-full overflow-hidden rounded-none p-0" onClick={() => setSelected(i)} aria-label={`View ${p.title}`}><img src={p.url} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /></Button>
      <div className="p-5"><p className="text-xs font-semibold text-primary">{[p.event_name, formatDate(p.event_date)].filter(Boolean).join(" · ")}</p><h3 className="mt-2 text-lg font-bold">{p.title}</h3>{p.caption && <p className="mt-2 text-sm text-muted-foreground">{p.caption}</p>}</div>
    </article>)}</div>
    <Dialog open={Boolean(current)} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[95dvh] max-w-4xl overflow-auto"><DialogTitle>{current?.title}</DialogTitle><DialogDescription>{current?.caption || current?.event_name || "The Baraka Initiative"}</DialogDescription>{current && <img src={current.url} alt={current.title} className="max-h-[65dvh] w-full object-contain" />}<div className="flex items-center justify-between"><Button variant="outline" size="icon" aria-label="Previous photo" disabled={photos.length < 2} onClick={() => setSelected(((selected ?? 0) - 1 + photos.length) % photos.length)}><ArrowLeft /></Button><span className="text-sm text-muted-foreground">{(selected ?? 0) + 1} / {photos.length}</span><Button variant="outline" size="icon" aria-label="Next photo" disabled={photos.length < 2} onClick={() => setSelected(((selected ?? 0) + 1) % photos.length)}><ArrowRight /></Button></div></DialogContent></Dialog>
  </>;
}