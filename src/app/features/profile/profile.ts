import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  TuiButton,
  TuiNotificationService,
  TuiTextfield,
  TuiLabel,
  TuiInput,
  TuiLoader,
  tuiLoaderOptionsProvider,
} from '@taiga-ui/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { ProfileService } from '../../core/services/profile/profile.service';
import {
  ChangeEmailRequest,
  ProfileResponse,
  UpdateProfileRequest,
} from '../../core/models/profile.model';
import { RoleBadge } from '../../core/components/role-badge/role-badge';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiInput,
    TuiTextfield,
    TuiLabel,
    TuiButtonLoading,
    DatePipe,
    TuiLoader,
    RoleBadge,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  providers: [tuiLoaderOptionsProvider({ size: 'l' })],
})
export class Profile implements OnInit {
  private alerts = inject(TuiNotificationService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  protected isPersonalLoading = false;
  protected isEmailLoading = false;
  protected isLoading = true;

  protected role = signal('');
  protected createdAt = signal(new Date());
  protected updatedAt = signal(new Date());

  readonly isAdmin = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'SYSTEM_ADMIN';
  });

  readonly personalForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
  });

  readonly emailForm = new FormGroup({
    email: new FormControl({ value: '', disabled: !this.isAdmin() }, [
      Validators.required,
      Validators.email,
    ]),
    confirmEmail: new FormControl({ value: '', disabled: !this.isAdmin() }, [
      Validators.required,
      Validators.email,
    ]),
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  protected savePersonalData(): void {
    if (this.personalForm.invalid) return;
    this.isPersonalLoading = true;

    const request: UpdateProfileRequest = {
      name: this.personalForm.value.fullName!,
      phoneNumber: this.personalForm.value.phoneNumber!,
    };

    this.profileService.updateProfile(request).subscribe({
      next: (profile: ProfileResponse) => {
        this.personalForm.patchValue({
          fullName: profile.name,
          phoneNumber: profile.phoneNumber,
        });

        this.personalForm.markAsPristine();
        this.updatedAt.set(profile.updatedAt);
        this.isPersonalLoading = false;

        this.alerts
          .open('Informações pessoais atualizadas.', { appearance: 'positive', label: 'Sucesso' })
          .subscribe();
      },
      error: () => {
        this.isPersonalLoading = false;
      },
    });
  }

  protected saveEmail(): void {
    if (this.emailForm.invalid) return;

    const emailValue = this.emailForm.value.email;
    const confirmEmailValue = this.emailForm.value.confirmEmail;

    if (emailValue !== confirmEmailValue) {
      this.alerts
        .open('Os e-mails informados não conferem.', { appearance: 'warning', label: 'Atenção' })
        .subscribe();
      return;
    }

    this.isEmailLoading = true;

    if (!emailValue || !confirmEmailValue) return;
    const request: ChangeEmailRequest = { email: emailValue, confirmEmail: confirmEmailValue };

    this.profileService.changeEmail(request).subscribe({
      next: (profile: ProfileResponse) => {
        this.emailForm.patchValue({
          email: profile.email,
          confirmEmail: '',
        });

        this.updatedAt.set(profile.updatedAt);

        this.emailForm.markAsPristine();
        this.isEmailLoading = false;
        this.alerts
          .open('Endereço de e-mail atualizado com sucesso.', {
            appearance: 'positive',
            label: 'Segurança',
          })
          .subscribe();
      },
    });
  }

  protected loadProfile(): void {
    this.profileService.findProfile().subscribe({
      next: (profile: ProfileResponse) => {
        this.personalForm.patchValue({
          fullName: profile.name,
          phoneNumber: profile.phoneNumber,
        });

        this.emailForm.patchValue({
          email: profile.email,
        });

        this.role.set(profile.role);
        this.createdAt.set(profile.createdAt);
        this.updatedAt.set(profile.updatedAt);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alerts
          .open('Não foi possível carregar os dados do perfil.', { appearance: 'negative' })
          .subscribe();
      },
    });
  }
}
