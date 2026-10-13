import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { passwordSchema } from "@/lib/schemas";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Login or Register — The Baraka Initiative" },
    { name: "description", content: "Sign in or create your Baraka Initiative account." },
    { property: "og:title", content: "Login — The Baraka Initiative" },
    { property: "og:description", content: "Sign in or create an account." },
  ] }),
  component: AuthPage,
});

const signUpSchema = z.object({ full_name: z.string().trim().min(2, "Enter your name").max(120), email: z.string().trim().email("Enter a valid email"), password: passwordSchema });
const signInSchema = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(1, "Enter your password") });

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setInfo("");
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = (mode === "up" ? signUpSchema : signInSchema).safeParse(raw);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setBusy(true);
    try {
      if (mode === "up") {
        const v = parsed.data as z.infer<typeof signUpSchema>;
        const { error } = await supabase.auth.signUp({ email: v.email, password: v.password, options: { emailRedirectTo: window.location.origin, data: { full_name: v.full_name } } });
        if (error) throw error;
        setInfo("Account created. Check your email and click the confirmation link, then sign in.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data as z.infer<typeof signInSchema>);
        if (error) throw error;
        navigate({ to: "/account" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(/invalid login/i.test(msg) ? "Incorrect email or password." : /not confirmed/i.test(msg) ? "Please confirm your email first — check your inbox." : msg);
    } finally { setBusy(false); }
  };

  const google = async () => {
    setError("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return setError("Google sign-in failed. Please try again.");
    if (r.redirected) return;
    navigate({ to: "/account" });
  };

  const cls = "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <section className="container-site flex justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-3xl font-extrabold">{mode === "in" ? "Welcome back" : "Create an account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === "in" ? "Sign in to your Baraka Initiative account." : "Join to track your applications and event registrations."}</p>
        <button onClick={google} className="mt-6 w-full rounded-full border border-border py-3 text-sm font-semibold hover:bg-secondary">Continue with Google</button>
        <div className="my-5 text-center text-xs text-muted-foreground">or with email</div>
        <form noValidate onSubmit={submit} className="grid gap-3">
          {mode === "up" && <input name="full_name" placeholder="Full name" className={cls} autoComplete="name" />}
          <input name="email" type="email" placeholder="Email" className={cls} autoComplete="email" />
          <input name="password" type="password" placeholder="Password" className={cls} autoComplete={mode === "up" ? "new-password" : "current-password"} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {info && <p role="status" className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">{info}</p>}
          <button disabled={busy} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="mt-5 flex justify-between text-sm">
          <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }} className="font-semibold text-primary">{mode === "in" ? "Create an account" : "I have an account"}</button>
          {mode === "in" && <Link to="/forgot-password" className="text-muted-foreground hover:text-primary">Forgot password?</Link>}
        </div>
      </div>
    </section>
  );
}
