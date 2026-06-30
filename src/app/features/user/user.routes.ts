import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/user-dashboard').then((m) => m.UserDashboard),
    title: 'Painel Administrativo - Dashboard',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
