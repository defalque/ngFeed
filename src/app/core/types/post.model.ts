import { z } from 'zod';
import { authorSchema } from './user.model';

const authorFields = authorSchema.shape;
export const postSchema = z.object({
  id: z.string(),
  created_at: z.iso.datetime(),
  title: z.string(),
  description: z.string().min(10, 'Deve contenere almeno 10 caratteri'),
  content: z.string().min(20, 'Deve contenere almeno 20 caratteri'),
  postImage: z.string().optional(),
  likesCount: z.number().nonnegative(),
  commentsCount: z.number().nonnegative(),
  userId: authorFields.id,
  userUsername: authorFields.username,
  userFirstName: authorFields.firstName,
  userLastName: authorFields.lastName,
  userIsVerified: authorFields.isVerified,
  userAvatar: authorFields.avatar,
});
// export type Post = z.infer<typeof postSchema>;

export const firebasePostSchema = postSchema.omit({
  id: true,
});
export type FirebasePost = z.infer<typeof firebasePostSchema>;

export const newPostFormSchema = postSchema.omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  postImage: true,
});
export type NewPost = z.infer<typeof newPostFormSchema>;

export const editPostFormSchema = postSchema.omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  created_at: true,
  userId: true,
  userUsername: true,
  userFirstName: true,
  userLastName: true,
  userIsVerified: true,
  userAvatar: true,
});
export type EditedPost = z.infer<typeof editPostFormSchema>;

export type Post = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  content: string;
  commentsCount: number;
  likesCount: number;
  userId: string;
  userUsername: string;
  userFirstName: string;
  userLastName: string;
  userIsVerified: boolean;
  userAvatar?: string;
};
