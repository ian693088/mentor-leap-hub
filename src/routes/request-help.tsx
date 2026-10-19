import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm, friendlyDbError, type Field } from "@/components/site/SimpleForm";
import { helpRequestSchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/request-help")({
  head: () => ({ meta: [
    { title: "Request Help — The Baraka Initiative" },
    { name: "description", content: "In need of support? Tell The Baraka Initiative how we can help you." },
    { property: "og:title", content: "Request Help — The Baraka Initiative" },
    { property: "og:description", content: "Tell us what you need and our team will review your request." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RequestHelp,
});

const fields: Field[] = [
  { name: "full_name", label: "Full name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone number", type: "tel", optional: true },
  { name: "need", label: "What would you like us to help you with?", textarea: true },
];

function RequestHelp() {
  const { user } = useAuth();
  const defaults = { email: user?.email ?? "", full_name: (user?.user_metadata?.["full_name"] as string) ?? "" };
  return (
    <>
      <PageHero eyebrow="Request help" title="We're here for you" text="Share your details and what you need. Our team reviews every request and will email you once it is approved." />
      <section className="container-site mt-12 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <SimpleForm schema={helpRequestSchema} defaults={defaults} fields={fields} submitLabel="Send request"
            successText="Thank you. Your request has been received — we'll email you once our team has reviewed it."
            onSubmit={async (v) => {
              const { error } = await supabase.from("help_requests").insert({ ...v, phone: v.phone || null, user_id: user?.id ?? null });
              friendlyDbError(error);
            }} />
        </div>
      </section>
    </>
  );
}
