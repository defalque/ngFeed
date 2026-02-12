import { Routes } from '@angular/router';
import { YourFeeds } from './your-feeds/your-feeds';

export const accountRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'feeds',
  },
  {
    path: 'feeds',
    component: YourFeeds,
  },
  {
    path: 'repost',
    component: YourFeeds,
  },
];
