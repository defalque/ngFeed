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

export type FirebasePost = Omit<Post, 'id'>;
export type NewPost = Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'postImage'>;
export type EditedPost = Pick<Post, 'title' | 'description' | 'content'>;
