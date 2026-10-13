import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { ZodSchema } from "zod";

export type Field = { name: string; label: string; type?: string; textarea?: boolean; options?: { value: string; label: string }[]; optional?: boolean };

export function SimpleForm<T>({ fields, schema, onSubmit, submitLabel = "Submit", successText = "Thank you! Your submission has been received and will be reviewed by our team.", defaults = {} }: {
  fields: Field[]; schema: ZodSchema<T>; onSubmit: (values: T) => Promise<void>; submitLabel?: string; successText?: string; defaults?: Record<string, string>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] ??= i.message; });
      setErrors(errs);
      return;
    }
    setErrors({}); setState("loading");
    try { await onSubmit(parsed.data); setState("done"); }
    catch (err) { setState("error"); setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
  };

  if (state === "done")
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl bg-secondary p-6 text-secondary-foreground">
        <CheckCircle2 className="mt-0.5 shrink-0 text-primary" />
        <div><p>{successText}</p><button onClick={() => setState("idle")} className="mt-2 text-sm font-semibold text-primary">Submit another</button></div>
      </div>
    );
  const cls = "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";
  return (
    <form noValidate onSubmit={handle} className="grid gap-4">
      {fields.map((f) => (
        <label key={f.name} className="grid gap-1.5 text-sm font-medium">
          <span>{f.label}{f.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}</span>
          {f.textarea ? <textarea name={f.name} rows={4} className={cls} aria-invalid={!!errors[f.name]} defaultValue={defaults[f.name]} />
            : f.options ? (
              <select name={f.name} className={cls} aria-invalid={!!errors[f.name]} defaultValue={defaults[f.name] ?? ""}>
                <option value="" disabled>Select…</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>)
            : <input name={f.name} type={f.type ?? "text"} className={cls} aria-invalid={!!errors[f.name]} defaultValue={defaults[f.name]} />}
          {errors[f.name] && <span className="text-xs text-destructive">{errors[f.name]}</span>}
        </label>
      ))}
      {state === "error" && <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle size={16} />{message}</p>}
      <button disabled={state === "loading"} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {state === "loading" && <Loader2 size={16} className="animate-spin" />}{state === "loading" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

export function friendlyDbError(e: { message: string; code?: string } | null) {
  if (!e) return;
  if (e.code === "23505") throw new Error("You have already submitted this with that email.");
  if (e.code === "42501" || /row-level security/i.test(e.message)) throw new Error("This submission isn't allowed right now (the event may be full or closed).");
  throw new Error("We couldn't save your submission. Please check your details and try again.");
}
