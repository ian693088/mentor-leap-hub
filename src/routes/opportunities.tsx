import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { opportunities } from "@/lib/site";

export const Route = createFileRoute("/opportunities")({
  head: () => ({ meta: [
    { title: "Opportunities — The Baraka Initiative" },
    { name: "description", content: "Scholarships, training, internships and events for young people." },
    { property: "og:title", content: "Opportunities — The Baraka Initiative" },
    { property: "og:description", content: "Scholarships, training, internships and events." },
  ] }),
  component: Opps,
});

function Opps() {
  return (
    <>
      <PageHero eyebrow="Opportunities" title="Verified opportunities for young people" text="Scholarships, training, internships and events — checked by our team." />
      <section className="container-site mt-16 grid gap-4">
        {opportunities.map((o) => (
          <div key={o.title} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">{o.type}</span>
              <h2 className="mt-1 text-lg font-bold">{o.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">Deadline: <span className="font-semibold text-foreground">{o.deadline}</span></p>
          </div>
        ))}
      </section>
    </>
  );
}
