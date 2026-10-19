import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm, friendlyDbError } from "@/components/site/SimpleForm";
import { contactSchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — The Baraka Initiative" },
    { name: "description", content: "Get in touch with The Baraka Initiative team." },
    { property: "og:title", content: "Contact The Baraka Initiative" },
    { property: "og:description", content: "Send us an enquiry." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
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
        <div className="mb-8 flex flex-wrap items-center gap-5">
          <Button asChild><a href="mailto:ian693088@gmail.com"><Mail /> EMAIL ME</a></Button>
          <a className="flex items-center gap-2 font-medium text-primary" href="tel:+254741287423"><Phone size={18} /> +254 74128 7423</a>
          <a className="flex items-center gap-2 font-medium text-primary" href="tel:+254717830060"><Phone size={18} /> Want to support us? +254 717 830060</a>
          <a className="break-all text-sm text-muted-foreground" href="mailto:ian693088@gmail.com">ian693088@gmail.com</a>
        </div>
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
