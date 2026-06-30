import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { TuiNotificationService } from '@taiga-ui/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const alerts = inject(TuiNotificationService);

  const role = authService.getUserRole();

  if (role === 'SYSTEM_ADMIN') {
    return true;
  }

  alerts.open('Área restrita para administradores do sistema.', {
    appearance: 'negative',
    label: 'Acesso Negado'
  }).subscribe();

  return router.createUrlTree(['/app/pos']);
};
