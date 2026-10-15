import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import mentorship from "@/assets/mentorship.jpg";
import talent from "@/assets/talent.jpg";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contentQuery } from "@/lib/queries";
import { iconFor, formatDate } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Baraka Initiative — Empowering potential. Transforming futures." },
      { name: "description", content: "Education, mentorship, STEM, talent and skills programs for school-going children and young people in Kenya." },
      { property: "og:title", content: "The Baraka Initiative" },
      { property: "og:description", content: "Every young person deserves a chance to thrive." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: Index,
});


function Index() {
  const { data } = useSuspenseQuery(contentQuery);
  const { programs, projects, news, impact } = data;
  const r = impact[0];
  const stats = [[`${r?.learners_reached ?? 0}+`, "Learners reached"], [String(programs.length), "Programs"], [`${r?.volunteers_engaged ?? 0}`, "Volunteers"], [`${r?.sessions_held ?? 0}`, "Sessions held"]];
  return (
    <>
      <section className="relative overflow-hidden bg-deep text-deep-foreground">
        <img src={hero} alt="Students building a solar-powered robot" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container-site relative py-24 md:py-36">
          <p className="eyebrow">Empowering potential. Transforming futures.</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] md:text-6xl">Every young person deserves a chance to thrive.</h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">Creating opportunities through education, mentorship, innovation, talent development and community empowerment.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/programs" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Explore Programs <ArrowRight size={18} /></Link>
            <Link to="/get-involved" className="rounded-full border border-deep-foreground/40 px-6 py-3 font-semibold">Join the Initiative</Link>
          </div>
        </div>
      </section>

      <section className="container-site -mt-10 relative grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["Education", "Learning resources and access to opportunities."], ["Innovation", "STEM, creativity and practical problem-solving."], ["Mentorship", "Connecting young people with positive guidance."], ["Talent", "Sports, arts and opportunities to grow."]].map(([t, d], i) => (
          <div key={t} className="rounded-xl border-t-4 border-primary bg-card p-5 shadow-card" style={{ borderTopColor: i % 2 ? "var(--accent)" : undefined }}>
            <h3 className="text-lg font-bold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">Our programs</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Six programs, one connected initiative</h2>
          <Link to="/programs" className="font-semibold text-primary">View all →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => { const Icon = iconFor(p.icon); return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-6">
              <Icon className="text-primary" />
              <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.short}</p>
            </div>
          ); })}
        </div>
      </section>

      <section className="mt-24 bg-primary text-primary-foreground">
        <div className="container-site grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          {stats.map(([n, l]) => (
            <div key={l}><p className="font-display text-4xl font-extrabold">{n}</p><p className="mt-1 text-sm opacity-85">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="container-site mt-24 grid items-center gap-10 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img src={mentorship} alt="Mentor guiding students in a library" loading="lazy" width={1200} height={912} className="aspect-[3/4] rounded-2xl object-cover" />
          <img src={talent} alt="Youth playing football at sunset" loading="lazy" width={1200} height={912} className="mt-10 aspect-[3/4] rounded-2xl object-cover" />
        </div>
        <div>
          <p className="eyebrow">Featured projects</p>
          <h2 className="mt-2 text-3xl font-extrabold">Work happening right now</h2>
          <div className="mt-6 grid gap-4">
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex justify-between text-sm"><span className="font-bold">{p.title}</span><span className="text-muted-foreground">{p.progress}%</span></div>
                <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${p.progress}%` }} /></div>
              </div>
            ))}
          </div>
          <Link to="/projects" className="mt-6 inline-block font-semibold text-primary">All projects →</Link>
        </div>
      </section>

      <section className="container-site mt-24">
        <p className="eyebrow">News & impact</p>
        <h2 className="mt-2 text-3xl font-extrabold">Latest updates</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {news.slice(0, 3).map((n) => (
            <article key={n.id} className="rounded-xl bg-secondary p-6">
              <p className="text-xs font-semibold text-primary">{formatDate(n.published_at)}</p>
              <h3 className="mt-2 font-bold">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-site mt-24">
        <div className="rounded-3xl bg-deep p-10 text-center text-deep-foreground md:p-16">
          <h2 className="text-3xl font-extrabold md:text-4xl">Help a young person thrive.</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-85">Volunteer, become a member, partner with us or submit a project idea.</p>
          <Link to="/get-involved" className="mt-7 inline-flex rounded-full bg-accent px-7 py-3 font-semibold text-accent-foreground">Get Involved</Link>
        </div>
      </section>
    </>
  );
}
