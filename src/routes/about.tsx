import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Us — The Baraka Initiative" },
    { name: "description", content: "Our mission, vision and values for empowering children and young people." },
    { property: "og:title", content: "About The Baraka Initiative" },
    { property: "og:description", content: "Our mission, vision and values." },
  ] }),
  component: About,
});

const values = [["Opportunity", "Open doors for every child regardless of background."], ["Safeguarding", "Children's safety and privacy come first, always."], ["Integrity", "Transparent use of every contribution."], ["Community", "Built with schools, families and local partners."]];

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="Unlocking the potential of every young person" text="The Baraka Initiative supports communities — especially school-going children and youth — through education, mentorship, innovation and talent development." />
      <section className="container-site mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-8 shadow-card"><p className="eyebrow">Mission</p><p className="mt-3 text-lg">To create opportunities for children and young people to learn, grow and lead through practical programs and caring mentorship.</p></div>
        <div className="rounded-2xl bg-primary p-8 text-primary-foreground"><p className="eyebrow">Vision</p><p className="mt-3 text-lg">Empowered young people transforming their futures and their communities.</p></div>
      </section>
      <section className="container-site mt-16">
        <h2 className="text-3xl font-extrabold">Our values</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([t, d]) => <div key={t} className="rounded-xl border border-border p-6"><h3 className="font-bold text-primary">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}
        </div>
      </section>
    </>
  );
}
