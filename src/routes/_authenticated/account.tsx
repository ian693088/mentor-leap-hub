import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { canManageGallery } from "@/lib/gallery";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — The Baraka Initiative" }, { name: "description", content: "Your account." }] }),
  component: Account,
});

function Account() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { roles } = useAuth();
  return (
    <section className="container-site py-16">
      <h1 className="text-3xl font-extrabold">My account</h1>
      <p className="mt-2 text-muted-foreground">Signed in as {user.email}</p>
      {canManageGallery(roles) && <Button asChild className="mt-6 mr-4"><Link to="/manage-gallery">Manage event photos</Link></Button>}
      <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }} className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Sign out</button>
    </section>
  );
}
