import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

type Field = { name: string; label: string; type?: string; textarea?: boolean; options?: string[] };

export function SimpleForm({ fields, submitLabel = "Submit" }: { fields: Field[]; submitLabel?: string }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setSent(true); };
  if (sent)
    return (
      <div className="flex items-start gap-3 rounded-xl bg-secondary p-6 text-secondary-foreground">
        <CheckCircle2 className="mt-0.5 shrink-0 text-primary" />
        <p>Thank you! Your submission has been received and will be reviewed by our team.</p>
      </div>
    );
  const cls = "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {fields.map((f) => (
        <label key={f.name} className="grid gap-1.5 text-sm font-medium">
          {f.label}
          {f.textarea ? <textarea required name={f.name} rows={4} className={cls} maxLength={1000} />
            : f.options ? <select required name={f.name} className={cls}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
            : <input required name={f.name} type={f.type ?? "text"} className={cls} maxLength={200} />}
        </label>
      ))}
      <button className="mt-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90">{submitLabel}</button>
    </form>
  );
}
