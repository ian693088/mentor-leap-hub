import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public, read-only content. Uses the publishable key; RLS only exposes published rows.
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [programs, projects, events, opportunities, news, impact] = await Promise.all([
    sb.from("programs").select("id,slug,title,short,body,icon,sort_order").eq("status", "published").order("sort_order"),
    sb.from("projects").select("id,title,summary,progress,program_id,programs(title)").eq("status", "published").order("created_at", { ascending: false }),
    sb.from("events").select("id,title,description,starts_at,venue,capacity,program_id,programs(title)").eq("status", "published").order("starts_at"),
    sb.from("opportunities").select("id,kind,title,description,deadline,link").eq("status", "published").order("deadline", { nullsFirst: false }),
    sb.from("news_posts").select("id,title,summary,body,published_at").eq("status", "published").order("published_at", { ascending: false }),
    sb.from("impact_reports").select("id,title,period,learners_reached,sessions_held,volunteers_engaged,summary").eq("status", "published").order("created_at", { ascending: false }),
  ]);
  const err = [programs, projects, events, opportunities, news, impact].find((r) => r.error);
  if (err?.error) console.error("public content error", err.error);
  return {
    programs: programs.data ?? [],
    projects: projects.data ?? [],
    events: events.data ?? [],
    opportunities: opportunities.data ?? [],
    news: news.data ?? [],
    impact: impact.data ?? [],
    error: err?.error ? "Content is temporarily unavailable." : null,
  };
});
