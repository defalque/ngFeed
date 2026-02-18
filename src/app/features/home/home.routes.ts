import { Routes } from '@angular/router';
import { ForYou } from './for-you/for-you';

export const homeRoutes: Routes = [
  { path: 'per-te', component: ForYou, title: 'ngFeed - Per te' },
  {
    path: 'seguiti',
    loadComponent: () => import('./followed/followed').then((mod) => mod.Followed),
    title: 'ngFeed - Seguiti',
  },
];
