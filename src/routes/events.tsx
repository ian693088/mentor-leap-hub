import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm, friendlyDbError } from "@/components/site/SimpleForm";
import { contentQuery } from "@/lib/queries";
import { formatDate } from "@/lib/site";
import { eventRegistrationSchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [
    { title: "Events — The Baraka Initiative" },
    { name: "description", content: "Upcoming workshops, tournaments, showcases and mentorship days — register online." },
    { property: "og:title", content: "Events — The Baraka Initiative" },
    { property: "og:description", content: "Upcoming activities you can register for." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: Events,
});

function Events() {
  const { data } = useSuspenseQuery(contentQuery);
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <>
      <PageHero eyebrow="Events" title="Join an upcoming activity" text="Workshops, tournaments, showcases and mentorship days. Registration takes a minute." />
      <section className="container-site mt-16 grid gap-6">
        {data.events.length === 0 && <p className="text-muted-foreground">No upcoming events right now.</p>}
        {data.events.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-7">
            {e.programs?.title && <span className="eyebrow">{e.programs.title}</span>}
            <h2 className="mt-2 text-xl font-bold">{e.title}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CalendarDays size={16} />{formatDate(e.starts_at, true)}</span>
              {e.venue && <span className="inline-flex items-center gap-1"><MapPin size={16} />{e.venue}</span>}
              {e.capacity && <span>{e.capacity} places</span>}
            </div>
            {e.description && <p className="mt-3 text-muted-foreground">{e.description}</p>}
            {openId === e.id ? (
              <div className="mt-6 max-w-lg">
                <SimpleForm
                  schema={eventRegistrationSchema}
                  submitLabel="Confirm registration"
                  successText="You're registered! We'll contact you with event details."
                  defaults={{ email: user?.email ?? "", full_name: (user?.user_metadata?.["full_name"] as string) ?? "" }}
                  fields={[{ name: "full_name", label: "Full name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone number", type: "tel", optional: true }]}
                  onSubmit={async (v) => {
                    const { error } = await supabase.from("event_registrations").insert({ event_id: e.id, user_id: user?.id ?? null, full_name: v.full_name, email: v.email, phone: v.phone || null });
                    friendlyDbError(error);
                  }}
                />
              </div>
            ) : (
              <button onClick={() => setOpenId(e.id)} className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">Register</button>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
