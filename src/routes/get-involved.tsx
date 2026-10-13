import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm, friendlyDbError, type Field } from "@/components/site/SimpleForm";
import { contentQuery } from "@/lib/queries";
import { contactSchema, membershipSchema, volunteerSchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const tabs = { volunteer: "Volunteer", member: "Become a Member", partner: "Partner With Us", donate: "Donate", idea: "Submit a Project Idea" } as const;
type Tab = keyof typeof tabs;

export const Route = createFileRoute("/get-involved")({
  validateSearch: z.object({ tab: z.enum(["volunteer", "member", "partner", "donate", "idea"]).optional(), program: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Get Involved — The Baraka Initiative" },
    { name: "description", content: "Volunteer, become a member, partner with us, donate or submit a project idea." },
    { property: "og:title", content: "Get Involved — The Baraka Initiative" },
    { property: "og:description", content: "Volunteer, join, partner or submit a project idea." },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: GetInvolved,
});

const base: Field[] = [{ name: "full_name", label: "Full name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone number", type: "tel", optional: true }];

function GetInvolved() {
  const { tab = "volunteer", program } = Route.useSearch();
  const navigate = useNavigate({ from: "/get-involved" });
  const { data } = useSuspenseQuery(contentQuery);
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const defaults = { email: user?.email ?? "", full_name: (user?.user_metadata?.["full_name"] as string) ?? "", program_id: program ?? "" };
  const enquiry = (topic: string, label: string) => (
    <SimpleForm key={topic} schema={contactSchema} defaults={{ ...defaults, topic }}
      fields={[...base, { name: "message", label, textarea: true }]}
      onSubmit={async (v) => { const { error } = await supabase.from("contact_enquiries").insert({ ...v, topic, phone: v.phone || null, user_id: uid }); friendlyDbError(error); }}
    />
  );
  return (
    <>
      <PageHero eyebrow="Get involved" title="There's a place for you here" text="Choose how you'd like to contribute. Every submission is reviewed by our team." />
      <section className="container-site mt-12 grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="flex gap-2 overflow-x-auto md:flex-col">
          {(Object.keys(tabs) as Tab[]).map((t) => (
            <button key={t} onClick={() => navigate({ search: { tab: t } })} className={`shrink-0 rounded-lg px-4 py-3 text-left text-sm font-semibold ${t === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{tabs[t]}</button>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">{tabs[tab]}</h2>
          {tab === "volunteer" && (
            <SimpleForm key="v" schema={volunteerSchema} defaults={defaults}
              fields={[...base, { name: "skills", label: "Your skills and interests", textarea: true }, { name: "availability", label: "Availability (e.g. weekends)", optional: true }]}
              onSubmit={async (v) => { const { error } = await supabase.from("volunteer_applications").insert({ ...v, phone: v.phone || null, availability: v.availability || null, user_id: uid }); friendlyDbError(error); }}
            />
          )}
          {tab === "member" && (
            <>
              {!user && <p className="mb-6 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">Tip: sign in first so your membership is linked to your account once approved.</p>}
              <SimpleForm key="m" schema={membershipSchema} defaults={defaults}
                fields={[...base, { name: "program_id", label: "Program of interest", options: data.programs.map((p) => ({ value: p.id, label: p.title })) }, { name: "message", label: "Why would you like to join?", textarea: true, optional: true }]}
                onSubmit={async (v) => { const { error } = await supabase.from("membership_applications").insert({ ...v, phone: v.phone || null, message: v.message || null, user_id: uid }); friendlyDbError(error); }}
              />
            </>
          )}
          {tab === "partner" && enquiry("Partnership", "Partnership proposal")}
          {tab === "donate" && (
            <>
              <p className="mb-6 text-sm text-muted-foreground">Share a donation enquiry and our team will contact you with verified ways to give. We never record a contribution until it is confirmed.</p>
              {enquiry("Donation", "How would you like to support?")}
            </>
          )}
          {tab === "idea" && enquiry("Project idea", "Describe your idea")}
        </div>
      </section>
    </>
  );
}
