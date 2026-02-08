import { Routes } from '@angular/router';
import { Account } from './account/account';
import { Home } from './home/home';
import { homeRoutes } from './home/home.routes';
import { Search } from './search/search';
import { accountRoutes } from './account/account.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'per-te', pathMatch: 'full' },
  {
    path: '',
    component: Home,
    children: homeRoutes,
  },
  { path: 'cerca', component: Search },
  { path: 'profilo', component: Account, children: accountRoutes },
];
