import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TuiButton, TuiDialogService, TuiHint, TuiIcon, TuiLoader, TuiNotificationService } from '@taiga-ui/core';
import { UsersService } from '../../../../core/services/users/users.service';
import { UserSummary } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RoleBadge } from '../../../../core/components/role-badge/role-badge';
import { StringUtils } from '../../../../core/utils/string.utils';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { UserStatus } from '../../../../core/enums/user-status.enum';
import { Subscription, timer } from 'rxjs';

interface TenantUserState {
  users: UserSummary[];
  totalElements: number;
  loading: boolean;
  page: number;
  size: number;
}

@Component({
  selector: 'app-users',
  imports: [RouterModule, TuiButton, TuiLoader, DatePipe, RoleBadge, TuiHint, TuiIcon],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private userService: UsersService = inject(UsersService);
  private authService: AuthService = inject(AuthService);

  private readonly alerts: TuiNotificationService = inject(TuiNotificationService);
  private readonly dialogs: TuiDialogService = inject(TuiDialogService);

  private loadingTimeout?: Subscription;

  protected currentUserRole = computed(() => this.authService.getUserRole());
  protected currentUserId = computed(() => this.authService.getUserId());

  protected sortColumn = signal<string>('name');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  protected state = signal<TenantUserState>({
    users: [],
    totalElements: 0,
    loading: false,
    page: 0,
    size: 10,
  });

  readonly users = computed(() => this.state().users);
  readonly loading = computed(() => this.state().loading);
  readonly totalElements = computed(() => this.state().totalElements);
  readonly page = computed(() => this.state().page);

  ngOnInit(): void {
    this.loadUsers(0);
  }

  protected loadUsers(page: number) {
    const sortParam = `${this.sortColumn()},${this.sortDirection()}`;

    this.loadingTimeout?.unsubscribe();
    this.loadingTimeout = timer(250).subscribe(() => {
      this.state.update((s) => ({ ...s, loading: true }));
    });

    this.userService.findAll(page, this.state().size, sortParam).subscribe({
      next: (response) => {
        this.loadingTimeout?.unsubscribe();
        this.state.update((s) => ({
          ...s,
          users: response.content,
          totalElements: response.page.totalElements,
          loading: false,
        }));
      },
      error: () => {
        this.loadingTimeout?.unsubscribe();
        this.state.update((s) => ({ ...s, loading: false }));
      },
    });
  }

  protected changePage(newPage: number): void {
    this.loadUsers(newPage);
  }

  protected onToggleStatus(userId: string): void {
    this.userService.toggleStatus(userId).subscribe();
  }

  protected canCreateUser(): boolean {
    return this.currentUserRole() === 'TENANT_ADMIN';
  }

  protected canManageUser(targetUserRole: string): boolean {
    const myRole = this.currentUserRole();
    if (myRole === 'TENANT_ADMIN') {
      return true;
    }
    if (myRole === 'MANAGER') {
      return targetUserRole !== 'TENANT_ADMIN';
    }
    return false;
  }

  protected getInitials(name: string): string {
    return StringUtils.getInitials(name, 'US');
  }

  protected confirmDelete(user: UserSummary): void {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Excluir Usuário?',
        size: 's',
        data: {
          content: `Tem certeza que deseja excluir o usuário <strong>${user.name}</strong>? Esta ação não pode ser desfeita e removerá o acesso dele ao sistema.`,
          yes: 'Sim, excluir',
          no: 'Cancelar',
        },
      })
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.deleteUser(user.id);
        }
      });
  }

  protected onSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.loadUsers(0);
  }

  private deleteUser(userId: string): void {
    this.state.update((s) => ({ ...s, loading: true }));
    this.userService.delete(userId).subscribe({
      next: () => {
        this.alerts.open('Usuário excluído com sucesso.', { appearance: 'positive' }).subscribe();
        this.loadUsers(0);
      },
      error: () => {
        this.state.update((s) => ({ ...s, loading: false }));
        this.alerts.open('Erro ao excluir o usuário.', { appearance: 'negative' }).subscribe();
      },
    });
  }

  protected readonly UserStatus = UserStatus;
}
