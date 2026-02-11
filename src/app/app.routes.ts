import { Routes } from '@angular/router';
import { Account } from './account/account';
import { Home } from './home/home';
import { homeRoutes } from './home/home.routes';
import { Search } from './search/search';
import { accountRoutes } from './account/account.routes';
import { FullFeed } from './account/full-feed/full-feed';
import { Favorites } from './favorites/favorites';
import { NotFound } from './ui/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'per-te', pathMatch: 'full' },
  {
    path: '',
    component: Home,
    children: homeRoutes,
  },
  { path: 'cerca', component: Search, title: 'ngFeed - Cerca' },
  { path: 'preferiti', component: Favorites, title: 'ngFeed - Preferiti' },
  {
    path: 'utente/:id',
    component: Account,
    children: accountRoutes,
  },
  {
    path: 'utente/:id/feed/:postId',
    component: FullFeed,
  },
  { path: '**', component: NotFound, title: 'Pagina non trovata' },
];
