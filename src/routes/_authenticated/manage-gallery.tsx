import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Upload, Trash2, Eye, EyeOff, Save, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { canManageGallery, galleryDetails, validatePhoto } from "@/lib/gallery";
import type { Database } from "@/integrations/supabase/types";

const managerQuery = queryOptions({ queryKey: ["gallery-manager"], queryFn: async () => {
  const { data, error } = await supabase.from("gallery_photos").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const photos = data ?? [];
  if (!photos.length) return [];
  const { data: urls, error: urlError } = await supabase.storage.from("event-gallery").createSignedUrls(photos.map(p => p.storage_path), 3600);
  if (urlError) throw new Error(urlError.message);
  return photos.map((p, i) => ({ ...p, url: urls?.[i]?.signedUrl ?? "" }));
} });
export const Route = createFileRoute("/_authenticated/manage-gallery")({
  head: () => ({ meta: [{ title: "Manage Event Photos — The Baraka Initiative" }, { name: "description", content: "Manage Baraka Initiative event photos." }, { property: "og:title", content: "Manage Event Photos — The Baraka Initiative" }, { property: "og:description", content: "Private photo management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managerQuery),
  component: Manager,
});
type Row = Database["public"]["Tables"]["gallery_photos"]["Row"];
const empty = { title: "", event_name: "", event_date: "", caption: "" };
function Manager() {
  const { data } = useSuspenseQuery(managerQuery);
  const { user, roles, loading } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refresh = async () => { await qc.invalidateQueries({ queryKey: ["gallery-manager"] }); await qc.invalidateQueries({ queryKey: ["gallery"] }); };
  const action = async (work: () => Promise<void>) => {
    setBusy(true); setError(""); setMessage("");
    try { await work(); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to save. Please try again."); } finally { setBusy(false); }
  };
  if (loading) return <section className="container-site py-16">Loading account…</section>;
  if (!canManageGallery(roles)) return <section className="container-site py-16"><h1 className="text-3xl font-bold">Photo management</h1><p className="mt-4 text-muted-foreground">An administrator account is required to manage event photos.</p><Button asChild className="mt-6"><Link to="/gallery">View gallery</Link></Button></section>;
  return <section className="container-site py-12"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-extrabold">Event photos</h1><Button asChild variant="outline"><Link to="/gallery"><Eye /> View gallery</Link></Button></div>
    <form className="mt-8 grid gap-4 border-y border-border py-8 md:grid-cols-2" onSubmit={e => { e.preventDefault(); void action(async () => {
      if (!user) throw new Error("Please sign in again.");
      const values = galleryDetails.parse(form);
      if (editing) {
        const { error: saveError } = await supabase.from("gallery_photos").update({ ...values, event_date: values.event_date || null, published }).eq("id", editing.id);
        if (saveError) throw new Error(saveError.message);
      } else {
        if (!file) throw new Error("Choose a photo first.");
        validatePhoto(file);
        const path = `${user.id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
        const { error: uploadError } = await supabase.storage.from("event-gallery").upload(path, file, { contentType: file.type });
        if (uploadError) throw new Error(uploadError.message);
        const { error: saveError } = await supabase.from("gallery_photos").insert({ ...values, event_date: values.event_date || null, storage_path: path, created_by: user.id, published });
        if (saveError) { await supabase.storage.from("event-gallery").remove([path]); throw new Error(saveError.message); }
      }
      setForm(empty); setEditing(null); setFile(null); setPublished(false); setMessage("Photo saved.");
    }); }}>
      <h2 className="text-xl font-bold md:col-span-2">{editing ? "Edit photo" : "Add a photo"}</h2>
      {!editing && <label className="grid gap-2 text-sm font-semibold md:col-span-2">Photo<input key={data.length} type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setFile(e.target.files?.[0] ?? null)} className="rounded-md border border-input bg-background p-3" /></label>}
      {([['title', 'Photo title'], ['event_name', 'Event name'], ['event_date', 'Event date']] as const).map(([name, label]) => <label key={name} className="grid gap-2 text-sm font-semibold">{label}<input type={name === 'event_date' ? 'date' : 'text'} required={name === 'title'} maxLength={120} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} className="rounded-md border border-input bg-background p-3" /></label>)}
      <label className="grid gap-2 text-sm font-semibold md:col-span-2">Caption<textarea maxLength={1000} value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} className="rounded-md border border-input bg-background p-3" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Publish in gallery</label>
      <div className="flex justify-end gap-3"><Button disabled={busy} type="submit">{editing ? <Save /> : <Upload />}{busy ? "Saving…" : editing ? "Save changes" : "Upload photo"}</Button>{editing && <Button variant="outline" type="button" onClick={() => { setEditing(null); setForm(empty); setPublished(false); }}><X /> Cancel</Button>}</div>
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}{message && <p role="status" className="mt-4 text-primary">{message}</p>}
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map(p => <article key={p.id} className="overflow-hidden rounded-lg border border-border"><img src={p.url} alt={p.title} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><h2 className="font-bold">{p.title}</h2><p className="mt-1 text-sm text-muted-foreground">{p.published ? "Published" : "Draft"} · {p.event_name}</p><div className="mt-4 flex gap-2"><Button variant="outline" size="icon" aria-label={`Edit ${p.title}`} disabled={busy} onClick={() => { setEditing(p); setForm({ title: p.title, event_name: p.event_name, event_date: p.event_date ?? "", caption: p.caption }); setPublished(p.published); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button><Button variant="outline" size="icon" aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.title}`} disabled={busy} onClick={() => void action(async () => { const { error } = await supabase.from("gallery_photos").update({ published: !p.published }).eq("id", p.id); if (error) throw new Error(error.message); setMessage("Photo visibility updated."); })}>{p.published ? <EyeOff /> : <Eye />}</Button><Button variant="outline" size="icon" aria-label={`Delete ${p.title}`} disabled={busy} onClick={() => { if (!window.confirm(`Delete “${p.title}”?`)) return; void action(async () => { const { error: deleteError } = await supabase.storage.from("event-gallery").remove([p.storage_path]); if (deleteError) throw new Error(deleteError.message); const { error } = await supabase.from("gallery_photos").delete().eq("id", p.id); if (error) throw new Error(error.message); setMessage("Photo deleted."); }); }}><Trash2 /></Button></div></div></article>)}</div>
  </section>;
}