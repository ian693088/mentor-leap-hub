import { z } from "zod";

export const galleryDetails = z.object({
  title: z.string().trim().min(2).max(120),
  event_name: z.string().trim().max(120),
  event_date: z.string().optional(),
  caption: z.string().trim().max(1000),
});
export const canManageGallery = (roles: string[]) => roles.includes("super_admin");
export function validatePhoto(file: { type: string; size: number }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP photo.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Each photo must be 10 MB or smaller.");
}