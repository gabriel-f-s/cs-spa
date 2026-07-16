import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  TuiButton,
  TuiError,
  TuiIcon,
  TuiInput,
  TuiNotificationService,
  TuiTextfield,
} from '@taiga-ui/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../../../core/services/users/users.service';
import { TuiPassword, TuiInputPhone, TuiChevron, TuiSelect, TuiDataListWrapper } from '@taiga-ui/kit';
import { CreateUser } from '../../../../core/models/user.model';
import { RoleUtils } from '../../../../core/utils/role.utils';
import { AuthService } from '../../../../core/services/auth/auth.service';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-user-create',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    TuiButton,
    TuiTextfield,
    TuiInput,
    TuiInputPhone,
    TuiError,
    TuiChevron,
    TuiSelect,
    TuiDataListWrapper,
    TuiIcon,
    TuiPassword,
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
})
export class UserCreate {
  private router = inject(Router);
  private userService = inject(UsersService);
  private authService = inject(AuthService);
  private alerts = inject(TuiNotificationService);

  protected saving = signal<boolean>(false);

  // Formulário de Criação
  protected createForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required]),
      role: new FormControl('Operador', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  protected availableRoles = computed(() =>
    RoleUtils.getAvailableRoles(this.authService.getUserRole()),
  );

  protected onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      let errorMsg = 'Preencha todos os campos corretamente.';
      if (this.createForm.errors?.['passwordMismatch']) {
        errorMsg = 'As senhas não conferem.';
      }

      this.alerts
        .open(errorMsg, {
          appearance: 'warning',
          label: 'Atenção',
        })
        .subscribe();
      return;
    }

    this.saving.set(true);

    const formValue = this.createForm.value;

    const newUserData: CreateUser = {
      name: formValue.name ?? '',
      email: formValue.email ?? '',
      phoneNumber: formValue.phoneNumber ?? '',
      role: RoleUtils.mapRoleToApi(formValue.role ?? 'Operador'),
      password: formValue.password ?? '',
    };

    this.userService.create(newUserData).subscribe({
      next: () => {
        this.saving.set(false);
        this.alerts
          .open('Usuário criado com sucesso!', {
            appearance: 'positive',
            label: 'Sucesso',
          })
          .subscribe();
        this.router.navigate(['/users']);
      },
      error: () => {
        this.saving.set(false);
        this.alerts
          .open('Erro ao criar o usuário. Tente novamente.', {
            appearance: 'negative',
          })
          .subscribe();
      },
    });
  }
}
