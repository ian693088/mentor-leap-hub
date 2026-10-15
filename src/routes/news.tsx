import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/SiteHeader";
import { contentQuery } from "@/lib/queries";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [
    { title: "News & Impact — The Baraka Initiative" },
    { name: "description", content: "Stories, announcements and impact from our programs." },
    { property: "og:title", content: "News & Impact — The Baraka Initiative" },
    { property: "og:description", content: "Stories and impact from our programs." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: News,
});

function News() {
  const { data } = useSuspenseQuery(contentQuery);
  return (
    <>
      <PageHero eyebrow="News & impact" title="Stories of change" text="Updates from our programs and the difference they are making." />
      {data.impact.map((r) => (
        <section key={r.id} className="container-site mt-12">
          <h2 className="text-xl font-bold">{r.title} <span className="text-sm font-normal text-muted-foreground">{r.period}</span></h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[[r.learners_reached, "Learners reached"], [r.sessions_held, "Sessions held"], [r.volunteers_engaged, "Volunteers engaged"]].map(([n, l]) => (
              <div key={String(l)} className="rounded-xl bg-primary p-6 text-primary-foreground"><p className="font-display text-3xl font-extrabold">{n}</p><p className="text-sm opacity-85">{l}</p></div>
            ))}
          </div>
          {r.summary && <p className="mt-3 text-sm text-muted-foreground">{r.summary}</p>}
        </section>
      ))}
      <section className="container-site mt-12 grid gap-5 md:grid-cols-3">
        {data.news.length === 0 && <p className="text-muted-foreground">No news yet.</p>}
        {data.news.map((n) => (
          <article key={n.id} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold text-accent">{formatDate(n.published_at)}</p>
            <h2 className="mt-2 text-lg font-bold">{n.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{n.summary}</p>
            {n.body && <p className="mt-3 whitespace-pre-line text-sm">{n.body}</p>}
          </article>
        ))}
      </section>
    </>
  );
}
