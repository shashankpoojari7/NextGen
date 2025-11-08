// const { email, mobile, password, fullname, username, dob } = body || {};
import * as z from 'zod'

export const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(20, { message: "Username must be at most 20 characters long" })


export const signUpSchema = z.object({
  identifier: z
    .string()
    .refine(
      (val) => /^\d{10}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      {
        message: "Please enter a valid mobile number or email address.",
      }
    ),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must include at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character" }),

  fullname: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" }),

  username: usernameSchema,

  dob: z
    .string()
    .refine(
      (value) => {
        const date = new Date(value);
        const now = new Date();
        return !isNaN(date.getTime()) && date <= now;
      },
      { message: "Please enter a valid date of birth not in the future" }
    ),
});

