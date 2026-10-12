import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm } from "@/components/site/SimpleForm";

export const Route = createFileRoute("/get-involved")({
  head: () => ({ meta: [
    { title: "Get Involved — The Baraka Initiative" },
    { name: "description", content: "Volunteer, become a member, partner with us, donate or submit a project idea." },
    { property: "og:title", content: "Get Involved — The Baraka Initiative" },
    { property: "og:description", content: "Volunteer, join, partner or submit a project idea." },
  ] }),
  component: GetInvolved,
});

const base = [{ name: "name", label: "Full name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone number", type: "tel" }];
const tabs = {
  Volunteer: [...base, { name: "skills", label: "Skills and availability", textarea: true }],
  "Become a Member": [...base, { name: "interest", label: "Program of interest", options: ["Education", "Mentorship", "STEM", "Sports & Arts", "Youth Skills"] }],
  "Partner With Us": [{ name: "org", label: "Organisation" }, ...base, { name: "proposal", label: "Partnership proposal", textarea: true }],
  Donate: [...base, { name: "message", label: "How would you like to support?", textarea: true }],
  "Submit a Project Idea": [...base, { name: "idea", label: "Describe your idea", textarea: true }],
};
type Tab = keyof typeof tabs;

function GetInvolved() {
  const [tab, setTab] = useState<Tab>("Volunteer");
  return (
    <>
      <PageHero eyebrow="Get involved" title="There's a place for you here" text="Choose how you'd like to contribute. Every submission is reviewed by our team." />
      <section className="container-site mt-12 grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="flex gap-2 overflow-x-auto md:flex-col">
          {(Object.keys(tabs) as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-lg px-4 py-3 text-left text-sm font-semibold ${t === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">{tab}</h2>
          {tab === "Donate" && <p className="mb-6 text-sm text-muted-foreground">Share a donation enquiry and our team will contact you with verified ways to give. We never record a contribution until it is confirmed.</p>}
          <SimpleForm key={tab} fields={tabs[tab]} />
        </div>
      </section>
    </>
  );
}
