import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/SiteHeader";
import { contentQuery } from "@/lib/queries";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/opportunities")({
  head: () => ({ meta: [
    { title: "Opportunities — The Baraka Initiative" },
    { name: "description", content: "Scholarships, training, internships and events for young people." },
    { property: "og:title", content: "Opportunities — The Baraka Initiative" },
    { property: "og:description", content: "Scholarships, training, internships and events." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: Opps,
});

function Opps() {
  const { data } = useSuspenseQuery(contentQuery);
  return (
    <>
      <PageHero eyebrow="Opportunities" title="Verified opportunities for young people" text="Scholarships, training, internships and events — checked by our team." />
      <section className="container-site mt-16 grid gap-4">
        {data.opportunities.length === 0 && <p className="text-muted-foreground">No opportunities open right now.</p>}
        {data.opportunities.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">{o.kind}</span>
              <h2 className="mt-1 text-lg font-bold">{o.title}</h2>
              {o.description && <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>}
            </div>
            <div className="text-right text-sm">
              {o.deadline && <p className="text-muted-foreground">Deadline: <span className="font-semibold text-foreground">{formatDate(o.deadline)}</span></p>}
              {o.link && <a href={o.link} target="_blank" rel="noreferrer" className="font-semibold text-primary">Apply →</a>}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
