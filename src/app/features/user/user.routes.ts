import { Routes } from '@angular/router';
import { UserPosts } from './user-posts/user-posts';

export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'posts',
  },
  {
    path: 'posts',
    component: UserPosts,
  },
  {
    path: 'repost',
    component: UserPosts,
  },
];
