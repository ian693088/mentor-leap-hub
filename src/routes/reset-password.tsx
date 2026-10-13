import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/lib/schemas";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Choose a new password — The Baraka Initiative" },
    { name: "description", content: "Set a new password for your account." },
    { property: "og:title", content: "New password — The Baraka Initiative" },
    { property: "og:description", content: "Set a new password." },
  ] }),
  component: Reset,
});

function Reset() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError("");
    const fd = new FormData(e.currentTarget);
    const pw = passwordSchema.safeParse(fd.get("password"));
    if (!pw.success) return setError(pw.error.issues[0].message);
    if (pw.data !== fd.get("confirm")) return setError("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.data });
    setBusy(false);
    if (error) return setError("This reset link is invalid or expired. Request a new one.");
    navigate({ to: "/account" });
  };
  const cls = "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm";
  return (
    <section className="container-site flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-3xl font-extrabold">Choose a new password</h1>
        <form noValidate onSubmit={submit} className="mt-6 grid gap-3">
          <input name="password" type="password" placeholder="New password" className={cls} autoComplete="new-password" />
          <input name="confirm" type="password" placeholder="Confirm password" className={cls} autoComplete="new-password" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button disabled={busy} className="rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Update password"}</button>
        </form>
      </div>
    </section>
  );
}
