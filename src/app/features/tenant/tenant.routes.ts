import { Routes } from '@angular/router';

export const tenantRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/tenant-dashboard').then((m) => m.TenantDashboard),
    title: 'Painel Administrativo',
    data: { breadcrumb: 'Painel Administrativo' },
  },
  {
    path: 'users',
    data: { breadcrumb: 'Usuários' },
    children: [
      {
        path: '',
        loadComponent: () => import('./users/user-list/user-list').then((m) => m.UserList),
        title: 'Gerenciar Usuários',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./users/user-create/user-create').then((m) => m.UserCreate),
        title: 'Novo Usuário',
        data: { breadcrumb: 'Novo Usuário' },
      },
      {
        path: ':id',
        loadComponent: () => import('./users/user-details/user-details').then((m) => m.UserDetails),
        data: { breadcrumb: 'Detalhes' },
      },
    ],
  },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

