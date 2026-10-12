import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { projects } from "@/lib/site";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [
    { title: "Projects — The Baraka Initiative" },
    { name: "description", content: "Follow our active community projects and their progress." },
    { property: "og:title", content: "Projects — The Baraka Initiative" },
    { property: "og:description", content: "Active community projects and progress." },
  ] }),
  component: Projects,
});

function Projects() {
  return (
    <>
      <PageHero eyebrow="Projects" title="Ideas turned into action" text="Track the milestones and progress of our ongoing projects." />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-7">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{p.program}</span>
            <h2 className="mt-4 text-xl font-bold">{p.title}</h2>
            <p className="mt-2 text-muted-foreground">{p.text}</p>
            <div className="mt-5 flex justify-between text-sm"><span>Progress</span><span className="font-semibold">{p.progress}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
          </div>
        ))}
      </section>
    </>
  );
}
