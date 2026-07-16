import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiButton,
  TuiInput,
  TuiLoader,
  TuiNotificationService,
  TuiTextfield,
} from '@taiga-ui/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersService } from '../../../../core/services/users/users.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserDetail } from '../../../../core/models/user.model';
import { DatePipe } from '@angular/common';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { RoleBadge } from '../../../../core/components/role-badge/role-badge';
import { PageMetaService } from '../../../../core/services/utils/page-meta.service';
import { StringUtils } from '../../../../core/utils/string.utils';
import { TuiChevron, TuiDataListWrapperComponent, TuiInputPhone, TuiSelect } from '@taiga-ui/kit';
import { RoleUtils } from '../../../../core/utils/role.utils';

@Component({
  selector: 'app-user-details',
  imports: [
    ReactiveFormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiTextfield,
    TuiInput,
    DatePipe,
    RoleBadge,
    RouterLink,
    TuiInputPhone,
    TuiChevron,
    TuiSelect,
    TuiDataListWrapperComponent,
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userService = inject(UsersService);
  private authService = inject(AuthService);
  private pageMeta = inject(PageMetaService);
  private alerts = inject(TuiNotificationService);

  protected user = signal<UserDetail | null>(null);
  protected loading = signal<boolean>(true);
  protected saving = signal<boolean>(false);

  protected isEditing = signal<boolean>(false);

  protected currentUserRole = computed(() => this.authService.getUserRole());
  protected canEditUser = computed(() => {
    const targetUser = this.user();
    if (!targetUser) return false;

    const myRole = this.currentUserRole();
    if (myRole === UserRole.TENANT_ADMIN) return true;
    if (myRole === UserRole.MANAGER) return targetUser.role !== UserRole.TENANT_ADMIN;
    return false;
  });

  protected availableRoles = computed(() => RoleUtils.getAvailableRoles(this.currentUserRole()));

  protected editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required]),
    role: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUserDetails(id);
    }
  }

  ngOnDestroy(): void {
    this.pageMeta.reset();
  }

  private loadUserDetails(id: string): void {
    this.loading.set(true);
    this.userService.findById(id).subscribe({
      next: (data: UserDetail) => {
        this.user.set(data);
        this.pageMeta.setMeta(data.name);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.alerts
          .open('Não foi possível carregar os dados do usuário.', { appearance: 'negative' })
          .subscribe();
      },
    });
  }

  protected enableEditMode(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.pageMeta.setMeta(`Editando ${this.user()?.name}`, this.user()?.name);

    this.editForm.patchValue({
      name: currentUser.name,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      role: RoleUtils.mapRoleToView(currentUser.role),
    });

    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.pageMeta.dynamicTitle.set(this.user()?.name || null);
    this.isEditing.set(false);
    this.editForm.reset();
  }

  protected saveChanges(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const userId = this.user()?.id;
    if (!userId) return;

    this.saving.set(true);
    const formValue = this.editForm.value;

    const updateData: Partial<UserDetail> = {
      name: formValue.name ?? undefined,
      email: formValue.email ?? undefined,
      phoneNumber: formValue.phoneNumber ?? undefined,
      role: RoleUtils.mapRoleToApi(formValue.role ?? ''),
    };

    this.userService.update(userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.isEditing.set(false);
        this.saving.set(false);
        this.alerts
          .open('Usuário atualizado com sucesso!', { appearance: 'positive', label: 'Sucesso' })
          .subscribe();
      },
      error: () => {
        this.saving.set(false);
        this.alerts.open('Erro ao atualizar o usuário.', { appearance: 'negative' }).subscribe();
      },
    });
  }

  protected getInitials(name: string): string {
    return StringUtils.getInitials(name, 'US');
  }
}
