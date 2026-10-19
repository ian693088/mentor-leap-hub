import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Dashboard — The Baraka Initiative" },
    { name: "description", content: "Private administrator dashboard." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "Admin Dashboard — The Baraka Initiative" },
    { property: "og:description", content: "Private administrator dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

const tabs = [
  { key: "profiles", label: "Registered users", cols: ["full_name", "email", "phone", "created_at"] },
  { key: "volunteer_applications", label: "Volunteers", cols: ["full_name", "email", "phone", "skills", "availability", "status", "created_at"] },
  { key: "membership_applications", label: "Members", cols: ["full_name", "email", "phone", "message", "status", "created_at"] },
  { key: "contact_enquiries", label: "Enquiries / Partners / Donors", cols: ["full_name", "email", "phone", "topic", "message", "created_at"] },
  { key: "event_registrations", label: "Event registrations", cols: ["full_name", "email", "phone", "created_at"] },
  { key: "user_roles", label: "Roles", cols: ["user_id", "role", "created_at"] },
] as const;
type TabKey = (typeof tabs)[number]["key"];

function AdminPage() {
  const { roles, loading } = useAuth();
  const [tab, setTab] = useState<TabKey>("profiles");
  if (loading) return <p className="container-site py-16">Loading…</p>;
  if (!roles.includes("super_admin")) return (
    <section className="container-site py-16"><h1 className="text-3xl font-extrabold">Admins only</h1><p className="mt-2 text-muted-foreground">Your account does not have administrator access.</p><Link to="/" className="mt-4 inline-block text-primary">Go home</Link></section>
  );
  const current = tabs.find((t) => t.key === tab)!;
  return (
    <section className="container-site py-10">
      <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
      <Counts />
      <AddAdmin />
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t.label}</button>
        ))}
      </div>
      <Table table={current.key} cols={current.cols as readonly string[]} />
    </section>
  );
}

function Counts() {
  const { data } = useQuery({ queryKey: ["admin-counts"], queryFn: async () => {
    const out: Record<string, number> = {};
    for (const t of tabs) {
      const { count } = await supabase.from(t.key).select("*", { count: "exact", head: true });
      out[t.key] = count ?? 0;
    }
    return out;
  } });
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      {tabs.slice(0, 5).map((t) => (
        <div key={t.key} className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">{t.label}</p>
          <p className="text-2xl font-extrabold text-primary">{data?.[t.key] ?? "…"}</p>
        </div>
      ))}
    </div>
  );
}

function Table({ table, cols }: { table: TabKey; cols: readonly string[] }) {
  const { data, isLoading, error } = useQuery({ queryKey: ["admin", table], queryFn: async () => {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data as Record<string, unknown>[];
  } });
  if (isLoading) return <p className="mt-6">Loading…</p>;
  if (error) return <p className="mt-6 text-destructive">Could not load records.</p>;
  if (!data?.length) return <p className="mt-6 text-muted-foreground">No records yet.</p>;
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary"><tr>{cols.map((c) => <th key={c} className="whitespace-nowrap px-3 py-2 capitalize">{c.replace(/_/g, " ")}</th>)}</tr></thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={String(r["id"] ?? i)} className="border-t border-border align-top">
              {cols.map((c) => <td key={c} className="max-w-xs px-3 py-2">{c === "created_at" ? formatDate(String(r[c]), true) : String(r[c] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddAdmin() {
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email.includes("@")) return setMsg("Enter a valid email.");
    const { data, error } = await supabase.rpc("grant_admin_by_email", { _email: email });
    if (error) return setMsg("Could not add admin.");
    if (data === "not_found") return setMsg("No account with that email yet — ask them to register first.");
    setMsg(`${email} is now an admin.`); form.reset();
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
  return (
    <form onSubmit={submit} className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
      <span className="text-sm font-semibold">Add another admin:</span>
      <input name="email" type="email" placeholder="their@email.com" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Make admin</button>
      {msg && <p className="w-full text-sm">{msg}</p>}
    </form>
  );
}
