import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Gallery is temporarily unavailable.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("gallery_photos").select("id,title,event_name,event_date,caption,storage_path").eq("published", true).order("created_at", { ascending: false });
  if (error) throw new Error("Gallery is temporarily unavailable.");
  if (!data.length) return [];
  const { data: urls, error: signingError } = await client.storage.from("event-gallery").createSignedUrls(data.map(p => p.storage_path), 3600);
  if (signingError) throw new Error("Photos are temporarily unavailable.");
  return data.map((photo, index) => ({ ...photo, url: (urls?.[index]?.signedUrl ?? "").replace(url, import.meta.env['VITE_SUPABASE_URL']) }));
});