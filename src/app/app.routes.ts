import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Home } from './features/home/home';
import { homeRoutes } from './features/home/home.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'per-te', pathMatch: 'full' },
  {
    path: '',
    component: Home,
    children: homeRoutes,
  },
  {
    path: 'cerca',
    loadComponent: () => import('./features/search/search').then((mod) => mod.Search),
    title: 'ngFeed - Cerca',
  },
  {
    path: 'preferiti',
    loadComponent: () => import('./features/favorites/favorites').then((mod) => mod.Favorites),
    title: 'ngFeed - Preferiti',
    canActivate: [authGuard],
  },
  {
    path: 'utente/:id',
    loadComponent: () => import('./features/user/user').then((mod) => mod.User),
    loadChildren: () => import('./features/user/user.routes').then((mod) => mod.userRoutes),
  },
  {
    path: 'utente/:id/posts/:postId',
    loadComponent: () => import('./features/posts/full-post/full-post').then((mod) => mod.FullPost),
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth').then((mod) => mod.Auth),
    title: 'Entra in ngFeed',
  },
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found/not-found').then((mod) => mod.NotFound),
    title: 'Pagina non trovata',
  },
];
