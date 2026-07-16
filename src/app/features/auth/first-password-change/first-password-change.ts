import { Component, inject, signal } from '@angular/core';
import {
  TuiButton,
  TuiError,
  TuiIcon,
  TuiInput, TuiLink,
  TuiNotificationService,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiButtonLoading, TuiPassword } from '@taiga-ui/kit';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../tenant/users/user-create/user-create';

@Component({
  selector: 'app-first-password-change',
  imports: [
    TuiButton,
    TuiTextfield,
    TuiInput,
    TuiIcon,
    TuiPassword,
    TuiError,
    ReactiveFormsModule,
    TuiButtonLoading,
    RouterLink,
    TuiLink,
  ],
  templateUrl: './first-password-change.html',
  styleUrl: './first-password-change.css',
})
export class FirstPasswordChange {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private alerts = inject(TuiNotificationService);

  protected submitting = signal<boolean>(false);
  private tempToken = signal<string | null>(null);

  protected passwordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.tempToken.set(token);
      } else {
        this.alerts
          .open('Sessão inválida ou expirada. Faça login novamente.', {
            appearance: 'negative',
          })
          .subscribe();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  protected onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const token = this.tempToken();
    if (!token) return;

    this.submitting.set(true);

    const payload = {
      password: this.passwordForm.value.password!,
      confirmPassword: this.passwordForm.value.confirmPassword!,
      tempToken: token,
    };

    this.authService.firstPasswordReset(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.alerts
          .open('Senha redefinida com sucesso! Redirecionando...', {
            appearance: 'positive',
          })
          .subscribe();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.submitting.set(false);
        this.alerts
          .open('Ocorreu um erro ao redefinir a senha. O token pode ter expirado.', {
            appearance: 'negative',
          })
          .subscribe();
      },
    });
  }
}
