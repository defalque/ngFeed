import { Routes } from '@angular/router';
import { Account } from './account';
import { YourFeeds } from './your-feeds/your-feeds';
import { NewFeed } from './new-feed/new-feed';
import { Update } from './update/update';

export const accountRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'i-tuoi-feed',
  },
  {
    path: 'i-tuoi-feed',
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
