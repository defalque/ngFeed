import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  username: z.string().trim().toLowerCase().min(5),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  isVerified: z.boolean(),
  bio: z.string(),
  location: z.string(),
  websiteUrl: z
    .url({
      protocol: /^https?$/,
    })
    .optional(),
  followersCount: z.number().nonnegative(),
  followingCount: z.number().nonnegative(),
});
export const authorSchema = userSchema.pick({
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  isVerified: true,
  avatar: true,
});
export type User = z.infer<typeof userSchema>;

export const editUserSchema = userSchema.omit({
  followersCount: true,
  followingCount: true,
  isVerified: true,
});
export type EditUserForm = z.infer<typeof editUserSchema>;
