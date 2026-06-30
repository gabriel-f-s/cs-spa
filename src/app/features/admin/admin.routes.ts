import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    title: 'Painel Administrativo - Dashboard',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
