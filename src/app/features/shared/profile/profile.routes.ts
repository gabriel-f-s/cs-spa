import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile').then((m) => m.Profile),
    title: 'Meu Perfil',
  },
  {
    path: 'security',
    loadComponent: () => import('./security/security').then((m) => m.Security),
    title: 'Segurança do Perfil',
    data: { breadcrumb: 'Segurança' },
  },
];
