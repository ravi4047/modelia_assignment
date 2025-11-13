import { z } from 'zod';

export const JwtPayloadSchema = z.object({
    sub: z.string(),
    email: z.string(),
})

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// export const UserSchema = z.object({
//     uid: z.string(),
// });

// export type User = z.infer<typeof UserSchema>;

export interface User{
    uid: string
}