import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { news } from "@/lib/site";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [
    { title: "News & Impact — The Baraka Initiative" },
    { name: "description", content: "Stories, announcements and impact from our programs." },
    { property: "og:title", content: "News & Impact — The Baraka Initiative" },
    { property: "og:description", content: "Stories and impact from our programs." },
  ] }),
  component: News,
});

const impact = [["1,200+", "Learners reached"], ["24", "Mentees graduated"], ["300", "Books donated"], ["8", "Workshops held"]];

function News() {
  return (
    <>
      <PageHero eyebrow="News & impact" title="Stories of change" text="Updates from our programs and the difference they are making." />
      <section className="container-site mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {impact.map(([n, l]) => <div key={l} className="rounded-xl bg-primary p-6 text-primary-foreground"><p className="font-display text-3xl font-extrabold">{n}</p><p className="text-sm opacity-85">{l}</p></div>)}
      </section>
      <section className="container-site mt-12 grid gap-5 md:grid-cols-3">
        {news.map((n) => (
          <article key={n.title} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold text-accent">{n.date}</p>
            <h2 className="mt-2 text-lg font-bold">{n.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{n.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
