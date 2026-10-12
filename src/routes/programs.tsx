import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { programs } from "@/lib/site";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Our Programs — The Baraka Initiative" },
    { name: "description", content: "Education, mentorship, STEM, sports and arts, youth skills and child welfare programs." },
    { property: "og:title", content: "Our Programs — The Baraka Initiative" },
    { property: "og:description", content: "Six programs supporting children and young people." },
  ] }),
  component: Programs,
});

function Programs() {
  return (
    <>
      <PageHero eyebrow="Our programs" title="Programs that grow with every learner" text="From the classroom to the football pitch, each program is managed as part of one connected initiative." />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {programs.map((p) => (
          <div key={p.slug} className="flex gap-5 rounded-2xl border border-border bg-card p-7">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><p.icon /></span>
            <div>
              <h2 className="text-xl font-bold">{p.title}</h2>
              <p className="mt-2 text-muted-foreground">{p.body}</p>
              <Link to="/get-involved" className="mt-3 inline-block text-sm font-semibold text-accent">Register interest →</Link>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
