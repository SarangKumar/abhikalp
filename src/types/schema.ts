import { z } from "zod";

export const SigninSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email required!" })
    .email({ message: "Invalid email!" }),
  password: z
    .string()
    .min(1, { message: "Password required!" })
    .min(6, { message: "Password must have at least 6 characters!" }),
});

export const SignupSchema = z
  .object({
    name: z.string().min(3, "Username must be at least 3 characters long"),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email required!" })
      .email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(1, { message: "Password required!" })
      .min(6, { message: "Password must have at least 6 characters!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const optionalUrl = z
  .union([z.literal(""), z.string().url("Enter a valid URL.")])
  .optional();

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .min(16, { message: "Description must be at least 16 characters." }),
  isPrivate: z.boolean(),
  isFavourite: z.boolean(),
  githubUrl: optionalUrl,
  deployedUrl: optionalUrl,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createSharelinkSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  expiresAt: z.date(),
  role: z.enum(["VIEWER", "EDITOR"]),
  projectId: z.string(),
});
