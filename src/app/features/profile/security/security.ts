import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TuiButtonLoading } from '@taiga-ui/kit';
import {
  TuiButton,
  TuiDialogService, TuiIcon,
  TuiInput,
  TuiLabel,
  TuiLoader,
  tuiLoaderOptionsProvider,
  TuiNotificationService,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../../core/services/profile/profile.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import {
  ChangePasswordRequest,
  DisableMfaRequest,
  ProfileResponse,
  SecurityProfile,
} from '../../../core/models/profile.model';
import { MfaVerifyRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-security',
  imports: [
    TuiButtonLoading,
    FormsModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiButton,
    TuiInput,
    TuiLabel,
    DatePipe,
    TuiLoader,
    QRCodeComponent,
    TuiIcon,
  ],
  templateUrl: './security.html',
  styleUrl: './security.css',
  providers: [tuiLoaderOptionsProvider({ size: 'l' })],
})
export class Security implements OnInit {
  private alerts = inject(TuiNotificationService);
  private cdr = inject(ChangeDetectorRef);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private dialogs = inject(TuiDialogService);
  private router = inject(Router);

  @ViewChild('mfaModalTemplate') mfaModalTemplate!: TemplateRef<any>;
  @ViewChild('disableMfaModalTemplate') disableMfaModalTemplate!: TemplateRef<any>;

  mfaEnabled = signal(false);
  isVerifying = signal(false);

  // Transformado em Signal para garantir a reatividade visual caso a API dê erro
  isUpdatingPassword = signal(false);
  protected isLoading = true;

  mfaVerifyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
  ]);

  mfaDisableControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
  ]);

  readonly isAdmin = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SYSTEM_ADMIN' || role === 'ROLE_SYSTEM_ADMIN';
  });

  readonly passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  protected lastLogin: Date = new Date();
  protected lastIp: string = '';
  protected lastUserAgent: string = '';

  protected passwordVisible = signal(false);
  protected confirmPasswordVisible = signal(false);

  protected token = signal('');
  protected otpAuthUri = signal('');

  ngOnInit(): void {
    this.loadSecurityProfile();
    this.cdr.detectChanges();
  }

  protected loadSecurityProfile(): void {
    this.profileService.findSecurityProfile().subscribe({
      next: (profile: SecurityProfile) => {
        if (this.isAdmin()) {
          this.lastLogin = profile.lastLoginAt ? profile.lastLoginAt : new Date();
          this.lastIp = profile.lastLoginIP ? profile.lastLoginIP : '';
          this.lastUserAgent = profile.lastLoginUserAgent ? profile.lastLoginUserAgent : '';
        }
        this.mfaEnabled.set(profile.mfaEnabled);
        this.isLoading = false;
      },
    });
  }

  protected updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const password = this.passwordForm.value.password;
    const confirmPassword = this.passwordForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.alerts
        .open('As senhas não conferem.', { appearance: 'warning', label: 'Atenção' })
        .subscribe();
      return;
    }

    this.isUpdatingPassword.set(true);

    const request: ChangePasswordRequest = {
      password: password!,
      confirmPassword: confirmPassword!,
    };

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.alerts
          .open('Senha atualizada com sucesso! Por favor, faça login novamente.', {
            appearance: 'positive',
            label: 'Segurança Atualizada',
          })
          .subscribe();

        this.authService.logout();
      },
      error: () => {
        this.isUpdatingPassword.set(false);
        this.alerts
          .open('Erro ao atualizar a senha. Verifique se ela atende aos requisitos de segurança.', {
            appearance: 'negative',
          })
          .subscribe();
      },
    });
  }

  // ==========================================
  // FLUXO DE ATIVAÇÃO DE MFA
  // ==========================================
  protected openMfaSetup(): void {
    this.mfaVerifyControl.reset();

    this.profileService.setupMfa().subscribe({
      next: (response) => {
        this.token.set(response.token);
        this.otpAuthUri.set(response.otpAuthUri);
      },
      error: () => {
        this.alerts
          .open('Erro ao carregar token. Tente novamente mais tarde.', { appearance: 'negative' })
          .subscribe();
      },
    });

    this.dialogs
      .open(this.mfaModalTemplate, {
        label: 'Configuração de Segurança',
        size: 'm',
        dismissible: false,
      })
      .subscribe();
  }

  protected verifyAndEnableMfa(observer: any): void {
    if (this.mfaVerifyControl.invalid) {
      this.mfaVerifyControl.markAsTouched();
      return;
    }

    const code = this.mfaVerifyControl.value;
    if (!code) return;

    this.isVerifying.set(true);

    const request: MfaVerifyRequest = {
      token: this.token(),
      code: code,
    };

    this.profileService.verifyMfa(request).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.mfaEnabled.set(true);
        observer.complete();
        this.alerts
          .open('Autenticação em duas etapas ativada!', {
            appearance: 'positive',
            label: 'Segurança Atualizada',
          })
          .subscribe();
      },
      error: () => {
        this.isVerifying.set(false);
        this.alerts
          .open('Código inválido ou expirado. Tente novamente.', { appearance: 'negative' })
          .subscribe();
      },
    });
  }

  // ==========================================
  // FLUXO DE DESATIVAÇÃO DE MFA
  // ==========================================
  protected disableMfa(): void {
    this.mfaDisableControl.reset();
    this.dialogs
      .open(this.disableMfaModalTemplate, {
        label: 'Desativar Verificação em Duas Etapas',
        size: 's',
        dismissible: false,
      })
      .subscribe();
  }

  protected confirmDisableMfa(observer: any): void {
    if (this.mfaDisableControl.invalid) {
      this.mfaDisableControl.markAsTouched();
      return;
    }

    const code = this.mfaDisableControl.value;
    if (!code) return;

    this.isVerifying.set(true);

    const request: DisableMfaRequest = {
      code: code,
    };

    this.profileService.disableMfa(request).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.mfaEnabled.set(false);
        observer.complete();
        this.alerts.open('MFA foi desativado com sucesso.', { appearance: 'info' }).subscribe();
      },
      error: () => {
        this.isVerifying.set(false);
        this.alerts
          .open('Código inválido. A desativação foi cancelada.', { appearance: 'negative' })
          .subscribe();
      },
    });
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }
}
