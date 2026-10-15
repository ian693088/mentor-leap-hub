import { describe, expect, it } from "vitest";
import { canManageGallery, validatePhoto } from "@/lib/gallery";

describe("gallery access", () => {
  it("permits super administrators only", () => {
    expect(canManageGallery(["super_admin"])).toBe(true);
    for (const role of ["coordinator", "member", "volunteer"]) expect(canManageGallery([role])).toBe(false);
    expect(canManageGallery([])).toBe(false);
  });
  it("accepts photos and rejects non-images", () => {
    expect(() => validatePhoto({ type: "image/jpeg", size: 100 })).not.toThrow();
    expect(() => validatePhoto({ type: "application/pdf", size: 100 })).toThrow();
  });
  it("caps photos at 10 MB", () => {
    expect(() => validatePhoto({ type: "image/png", size: 10 * 1024 * 1024 })).not.toThrow();
    expect(() => validatePhoto({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toThrow();
  });
});