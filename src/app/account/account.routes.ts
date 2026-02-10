import { Routes } from '@angular/router';
import { Account } from './account';
import { YourFeeds } from './your-feeds/your-feeds';
import { NewFeed } from './new-feed/new-feed';
import { Update } from './update/update';
import { FullFeed } from './full-feed/full-feed';

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
    path: 'nuovo-feed',
    component: NewFeed,
  },
  {
    path: 'modifica',
    component: Update,
  },
];
