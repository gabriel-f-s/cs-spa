import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((c) => c.Login),
    title: 'Login | Controle Smart',
  },
  {
    path: 'recovery',
    loadComponent: () => import('./recovery/recovery').then(c => c.Recovery),
    title: 'Recuperar Senha',
  },
  {
    path: 'mfa',
    loadComponent: () => import('./mfa/mfa').then(c => c.Mfa),
    title: 'Autenticação de Dois Fatores',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
