export type FirebaseUser = {
  localId: string; // The uid of the authenticated user.
  email: string; // The email for the authenticated user
  idToken: string; // A Firebase Auth ID token for the authenticated user.
  expirationDate: Date; // The number of seconds in which the ID token expires.
};

type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio: string;
  location: string;
  websiteUrl: string;
  isVerified: boolean;
};

type UserStats = {
  followersCount: number;
  followingCount: number;
};

export type User = UserProfile &
  UserStats & {
    id: string;
  };

export type NewUser = UserProfile & UserStats;

export type EditedUser = Omit<
  NewUser,
  'followersCount' | 'followingCount' | 'location' | 'websiteUrl'
> & {
  location?: string;
  websiteUrl?: string;
};
