import * as z from "zod";

export const PostGenerationDto = z.object({
    prompt: z.string(),
    style: z.string()
})


// export const GetGenerationDto = z.object({
//     limit: z.string()
// })

export const GetGenerationDto = z.object({
  limit: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (Number.isNaN(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: 'limit must be a valid integer',
        path: ['limit'],
        fatal: true,
      });
      return z.NEVER;
    }
    return parsed;
  }),
});