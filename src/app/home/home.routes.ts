import { Routes } from '@angular/router';
import { Feed } from './feed/feed';
import { Followed } from './followed/followed';

export const homeRoutes: Routes = [
  { path: 'per-te', component: Feed },
  { path: 'seguiti', component: Followed },
];
