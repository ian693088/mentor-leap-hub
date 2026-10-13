import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm, friendlyDbError } from "@/components/site/SimpleForm";
import { contactSchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — The Baraka Initiative" },
    { name: "description", content: "Get in touch with The Baraka Initiative team." },
    { property: "og:title", content: "Contact The Baraka Initiative" },
    { property: "og:description", content: "Send us an enquiry." },
  ] }),
  component: Contact,
});

const topics = ["Parent / Guardian", "School / Teacher", "Partner organisation", "Volunteer", "Other"];

function Contact() {
  const { user } = useAuth();
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk" text="Schools, partners, parents and volunteers — we'd love to hear from you." />
      <section className="container-site mt-12 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <SimpleForm schema={contactSchema} submitLabel="Send message" successText="Thank you! Your message has been received. Our team will reply by email."
            defaults={{ email: user?.email ?? "" }}
            fields={[{ name: "full_name", label: "Full name" }, { name: "email", label: "Email", type: "email" }, { name: "phone", label: "Phone number", type: "tel", optional: true }, { name: "topic", label: "I am a", options: topics.map((t) => ({ value: t, label: t })) }, { name: "message", label: "Message", textarea: true }]}
            onSubmit={async (v) => { const { error } = await supabase.from("contact_enquiries").insert({ ...v, phone: v.phone || null, user_id: user?.id ?? null }); friendlyDbError(error); }}
          />
        </div>
      </section>
    </>
  );
}
