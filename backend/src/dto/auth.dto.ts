import * as z from "zod";

/// I think this should be SignUpDto instead of LoginDto
// LoginDto should just be minimum 1 character - because we don't want to give hints
// what's the requirement of the password during Login

// export const LoginDto = z.object({
export const SignUpDto = z.object({
    email: z.email(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

export const LoginDto = z.object({
    email: z.email(),
    password: z.string().nonempty()
})