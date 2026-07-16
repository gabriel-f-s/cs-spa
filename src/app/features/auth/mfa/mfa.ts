import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthResponse, MfaVerifyRequest } from '../../../core/models/auth.model';
import { ErrorResponse } from '../../../core/models/error.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { jwtDecode } from 'jwt-decode';
import { TuiButton, TuiError, TuiInput, TuiLink, TuiNotificationService, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-mfa',
  imports: [
    RouterLink,
    TuiButtonLoading,
    TuiError,
    ReactiveFormsModule,
    TuiInput,
    TuiButton,
    TuiTextfield,
    TuiLink,
  ],
  templateUrl: './mfa.html',
  styleUrl: './mfa.css',
})
export class Mfa implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private alerts: TuiNotificationService,
  ) {}

  private pendingToken: string | null = null;
  protected isLoading = true;

  isVerifying = signal(false);

  protected mfaForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
  });

  ngOnInit(): void {
    this.pendingToken = sessionStorage.getItem('mfa_pending_token');
    if (!this.pendingToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  protected verifyCode(): void {

    const codeValue = this.mfaForm.get('code')?.value;

    if (!codeValue || codeValue.length !== 6) {
      this.mfaForm.markAllAsTouched();
      return;
    }

    if (!this.pendingToken) return;

    this.isVerifying.set(true);
    const request: MfaVerifyRequest = {
      token: this.pendingToken,
      code: codeValue,
    };

    this.authService.verifyMfaAndLogin(request).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;

        sessionStorage.removeItem('mfa_pending_token');
        const rememberMe: boolean = Boolean(sessionStorage.getItem('remember_me'));
        sessionStorage.removeItem('remember_me');

        this.authService.setSession(response, rememberMe);
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
      error: (error: ErrorResponse) => {
        this.isVerifying.set(false);
        this.mfaForm.get('code')?.reset();
        this.alerts.open('Código incorreto ou expirado.', {
          appearance: 'negative',
          label: 'Falha na autenticação'
        }).subscribe();
      }
    });
  }

  protected cancelLogin() {
    sessionStorage.removeItem('mfa_pending_token');
    this.router.navigate(['/auth/login']);
  }
}
