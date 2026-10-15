import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/SiteHeader";
import { contentQuery } from "@/lib/queries";
import { iconFor } from "@/lib/site";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Our Programs — The Baraka Initiative" },
    { name: "description", content: "Education, mentorship, STEM, sports and arts, youth skills and child welfare programs." },
    { property: "og:title", content: "Our Programs — The Baraka Initiative" },
    { property: "og:description", content: "Six programs supporting children and young people." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: Programs,
});

function Programs() {
  const { data } = useSuspenseQuery(contentQuery);
  return (
    <>
      <PageHero eyebrow="Our programs" title="Programs that grow with every learner" text="From the classroom to the football pitch, each program is managed as part of one connected initiative." />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {data.programs.length === 0 && <p className="text-muted-foreground">No programs published yet.</p>}
        {data.programs.map((p) => {
          const Icon = iconFor(p.icon);
          return (
            <div key={p.id} className="flex gap-5 rounded-2xl border border-border bg-card p-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon /></span>
              <div>
                <h2 className="text-xl font-bold">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{p.body ?? p.short}</p>
                <Link to="/get-involved" search={{ tab: "member", program: p.id }} className="mt-3 inline-block text-sm font-semibold text-accent">Register interest →</Link>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
