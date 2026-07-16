import { Routes } from '@angular/router';
import { AuthLayout } from './core/layouts/auth-layout/auth-layout';
import { UserLayout } from './core/layouts/user-layout/user-layout';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: UserLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/tenant/tenant.routes').then((m) => m.tenantRoutes),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/shared/profile/profile.routes').then((m) => m.profileRoutes),
        data: { breadcrumb: 'Minha Conta' },
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/shared/profile/profile.routes').then((m) => m.profileRoutes),
      },
    ],
  },
];
