import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "Reset your password — The Baraka Initiative" },
    { name: "description", content: "Get a link to reset your password." },
    { property: "og:title", content: "Reset password — The Baraka Initiative" },
    { property: "og:description", content: "Get a password reset link." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Forgot,
});

function Forgot() {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const email = z.string().trim().email().safeParse(new FormData(e.currentTarget).get("email"));
    if (!email.success) return setError("Enter a valid email address.");
    setState("busy");
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) { setState("idle"); return setError("Could not send the link. Please try again later."); }
    setState("sent");
  };
  return (
    <section className="container-site flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-3xl font-extrabold">Forgot password</h1>
        {state === "sent" ? <p className="mt-4 rounded-lg bg-secondary p-4 text-sm">If an account exists for that email, a reset link is on its way.</p> : (
          <form noValidate onSubmit={submit} className="mt-6 grid gap-3">
            <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm" />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button disabled={state === "busy"} className="rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">{state === "busy" ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <Link to="/auth" className="mt-5 inline-block text-sm font-semibold text-primary">Back to sign in</Link>
      </div>
    </section>
  );
}
