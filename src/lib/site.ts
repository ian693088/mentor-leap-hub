import { BookOpen, Users, Cpu, Trophy, Briefcase, HeartHandshake, type LucideIcon } from "lucide-react";

export const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/programs", label: "Our Programs" },
  { to: "/projects", label: "Projects" },
  { to: "/events", label: "Events" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/news", label: "News & Impact" },
  { to: "/contact", label: "Contact" },
] as const;

export const programIcons: Record<string, LucideIcon> = {
  book: BookOpen, users: Users, cpu: Cpu, trophy: Trophy, briefcase: Briefcase, heart: HeartHandshake,
};
export const iconFor = (name: string | null | undefined) => programIcons[name ?? ""] ?? BookOpen;

export const formatDate = (d: string | null | undefined, withTime = false) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }) : "";
