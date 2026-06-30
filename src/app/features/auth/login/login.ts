import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  TuiButton,
  TuiError,
  TuiLink,
  TuiTextfield,
  TuiCheckbox,
  TuiInput,
} from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TuiNotificationService } from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TuiInput,
    TuiButton,
    TuiLink,
    TuiCheckbox,
    TuiError,
    TuiTextfield,
    TuiButtonLoading,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  constructor(
    private router: Router,
    private authService: AuthService,
    private alerts: TuiNotificationService,
  ) {}

  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    remember: new FormControl(false),
  });

  isLoading: boolean = false;

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.alerts
        .open('Preencha os campos corretamente antes de continuar.', {
          appearance: 'warning',
          label: 'Atenção',
        })
        .subscribe();
      return;
    }

    this.isLoading = true;

    const request: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };
    const rememberMe = this.loginForm.value.remember ?? false;

    this.authService.login(request, rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.mfaRequired && response.mfaToken) {
          sessionStorage.setItem('mfa_pending_token', response.mfaToken);
          sessionStorage.setItem('remember_me', String(rememberMe));
          this.router.navigate(['/auth/mfa']);
          return;
        }

        const decodedToken: any = jwtDecode(response.accessToken);
        const userRole = decodedToken.role;

        this.alerts
          .open('Login realizado com sucesso!', {
            appearance: 'positive',
            label: 'Bem-vindo de volta',
          })
          .subscribe();

        if (userRole === 'SYSTEM_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.alerts
          .open('E-mail ou senha incorretos.', {
            appearance: 'error',
            label: 'Falha na autenticação',
            autoClose: 5000,
          })
          .subscribe();
      },
    });
  }
}
