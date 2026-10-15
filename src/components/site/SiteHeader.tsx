import { Link } from "@tanstack/react-router";
import { Menu, X, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { nav } from "@/lib/site";
import logo from "@/assets/baraka-logo.jpeg.asset.json";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 leading-none">
      <img src={logo.url} alt="The Baraka Initiative logo" className="h-14 w-14 object-contain" />
      <span className="font-display text-sm font-extrabold">
        THE BARAKA<br /><span className="text-accent">INITIATIVE</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/get-involved" className="hidden rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground lg:inline-flex">Join Us</Link>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu /></Button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-deep/60" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col gap-1 bg-background p-6 shadow-card">
            <Button variant="ghost" size="icon" aria-label="Close menu" className="mb-4 self-end" onClick={() => setOpen(false)}><X /></Button>
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-medium hover:bg-secondary" activeProps={{ className: "bg-secondary text-primary" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </aside>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-deep text-deep-foreground">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold">THE BARAKA <span className="text-accent">INITIATIVE</span></p>
          <p className="mt-3 text-sm opacity-80">Empowering potential. Transforming futures.</p>
          <div className="mt-5 flex flex-col items-start gap-3">
            <Button asChild><a href="mailto:ian693088@gmail.com"><Mail /> EMAIL ME</a></Button>
            <a href="mailto:ian693088@gmail.com" className="break-all text-sm">ian693088@gmail.com</a>
            <a href="tel:+254741287423" className="flex items-center gap-2 text-sm"><Phone size={16} /> +254 74128 7423</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {nav.map((n) => <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link>)}
        </div>
        <p className="text-sm opacity-80">We are committed to safeguarding children and young people. We collect only the information we need and protect it carefully.</p>
      </div>
      <div className="border-t border-deep-foreground/10 py-5 text-center text-xs opacity-60">© {new Date().getFullYear()} The Baraka Initiative</div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="bg-secondary">
      <div className="container-site py-16 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{text}</p>
      </div>
    </section>
  );
}
