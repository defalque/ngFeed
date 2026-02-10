import { Routes } from '@angular/router';
import { Account } from './account/account';
import { Home } from './home/home';
import { homeRoutes } from './home/home.routes';
import { Search } from './search/search';
import { accountRoutes } from './account/account.routes';
import { FullFeed } from './account/full-feed/full-feed';
import { Favorites } from './favorites/favorites';

export const routes: Routes = [
  { path: '', redirectTo: 'per-te', pathMatch: 'full' },
  {
    path: '',
    component: Home,
    children: homeRoutes,
  },
  { path: 'cerca', component: Search },
  { path: 'preferiti', component: Favorites },
  { path: ':id', component: Account, children: accountRoutes },
  { path: ':id/feed/:postId', component: FullFeed },
];
