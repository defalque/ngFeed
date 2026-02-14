import { Routes } from '@angular/router';
import { User } from './features/user/user';
import { Home } from './features/home/home';
import { homeRoutes } from './features/home/home.routes';
import { Search } from './features/search/search';
import { FullPost } from './features/posts/full-post/full-post';
import { Favorites } from './features/favorites/favorites';
import { NotFound } from './core/pages/not-found/not-found';
import { userRoutes } from './features/user/user.routes';

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
    component: User,
    children: userRoutes,
  },
  {
    path: 'utente/:id/posts/:postId',
    component: FullPost,
  },
  { path: '**', component: NotFound, title: 'Pagina non trovata' },
];
