import { z } from "zod";

const name = z.string().trim().min(2, "Please enter your full name").max(120);
const email = z.string().trim().email("Enter a valid email address").max(255);
const phone = z.string().trim().max(30).regex(/^[+0-9 ()-]*$/, "Use digits only").optional().or(z.literal(""));

export const volunteerSchema = z.object({
  full_name: name, email, phone,
  skills: z.string().trim().min(2, "Tell us about your skills").max(1000),
  availability: z.string().trim().max(200).optional().or(z.literal("")),
});
export const membershipSchema = z.object({
  full_name: name, email, phone,
  program_id: z.string().uuid("Choose a program"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});
export const contactSchema = z.object({
  full_name: name, email, phone,
  topic: z.string().trim().min(1).max(60),
  message: z.string().trim().min(2, "Please write a message").max(2000),
});
export const eventRegistrationSchema = z.object({ full_name: name, email, phone });

export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(72);
