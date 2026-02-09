export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  bio: string;
  location: string;
  websiteUrl: string;
  followersCount: number;
  followingCount: number;
};
