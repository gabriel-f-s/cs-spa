import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((c) => c.Login),
    title: 'Login',
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
  {
    path: 'first-password',
    loadComponent: () => import('./first-password-change/first-password-change').then(c => c.FirstPasswordChange),
    title: 'Atualização de Senha'
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
