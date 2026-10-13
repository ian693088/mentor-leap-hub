import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
type AuthState = { user: User | null; roles: AppRole[]; loading: boolean; refreshRoles: () => Promise<void> };
const Ctx = createContext<AuthState>({ user: null, roles: [], loading: true, refreshRoles: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const qc = useQueryClient();

  const loadRoles = async (uid: string | undefined) => {
    if (!uid) return setRoles([]);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => loadRoles(session?.user.id).finally(() => setLoading(false)), 0);
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") qc.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={{ user, roles, loading, refreshRoles: () => loadRoles(user?.id) }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
export const isStaff = (roles: AppRole[]) => roles.includes("super_admin") || roles.includes("coordinator");
