import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteHeader";
import { SimpleForm } from "@/components/site/SimpleForm";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — The Baraka Initiative" },
    { name: "description", content: "Get in touch with The Baraka Initiative team." },
    { property: "og:title", content: "Contact The Baraka Initiative" },
    { property: "og:description", content: "Send us an enquiry." },
  ] }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk" text="Schools, partners, parents and volunteers — we'd love to hear from you." />
      <section className="container-site mt-12 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <SimpleForm submitLabel="Send message" fields={[{ name: "name", label: "Full name" }, { name: "email", label: "Email", type: "email" }, { name: "topic", label: "I am a", options: ["Parent / Guardian", "School / Teacher", "Partner organisation", "Volunteer", "Other"] }, { name: "message", label: "Message", textarea: true }]} />
        </div>
      </section>
    </>
  );
}
