import { Routes } from '@angular/router';
import { Followed } from './followed/followed';
import { ForYou } from './for-you/for-you';

export const homeRoutes: Routes = [
  { path: 'per-te', component: ForYou, title: 'ngFeed - Per te' },
  { path: 'seguiti', component: Followed, title: 'ngFeed - Seguiti' },
];
