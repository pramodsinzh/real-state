import { z } from "zod"

export const signUpSchema = z
  .object({
    name: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(7, "Enter a valid phone number"),
    role: z.enum(["tenant", "manager"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})