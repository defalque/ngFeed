export type Post = {
  id: string;
  title: string;
  description: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  userId: string;
  userUsername: string;
  userFirstName: string;
  userLastName: string;
  userIsVerified: boolean;
  userAvatar?: string;
};
