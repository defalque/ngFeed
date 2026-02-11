import { Routes } from '@angular/router';
import { YourFeeds } from './your-feeds/your-feeds';
import { NewFeed } from './new-feed/new-feed';
import { Update } from './update/update';

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
];
