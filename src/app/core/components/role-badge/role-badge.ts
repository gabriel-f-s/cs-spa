import { ChangeDetectionStrategy, Component, computed, Input, input, signal } from '@angular/core';
import { UserRole } from '../../enums/user-role.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-role-badge',
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border"
      [ngClass]="badgeStyle()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="size-3.5 shrink-0"
      >
        <path [attr.d]="badgeIcon()" fill-rule="evenodd" clip-rule="evenodd" />
      </svg>
      {{ badgeText() }}
    </span>
  `,
  styleUrl: './role-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleBadge {
  roleInput = signal<UserRole | string>('OPERATOR');

  @Input({ required: true })
  set role(value: string) {
    this.roleInput.set(value);
  }

  readonly badgeText = computed(() => {
    switch (this.roleInput()) {
      case 'SYSTEM_ADMIN':
        return 'Administrador do Sistema';
      case 'TENANT_ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'OPERATOR':
        return 'Operador';
      default:
        return 'Desconhecido';
    }
  });

  readonly badgeStyle = computed(() => {
    switch (this.roleInput()) {
      case 'SYSTEM_ADMIN':
        return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/40 dark:border-red-500/20';
      case 'TENANT_ADMIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/40 dark:border-blue-500/20';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/40 dark:border-amber-500/20';
      case 'OPERATOR':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200/40 dark:border-slate-500/20';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200/40 dark:border-gray-500/20';
    }
  });

  readonly badgeIcon = computed(() => {
    switch (this.roleInput()) {
      case 'SYSTEM_ADMIN':
        return 'M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z';
      case 'TENANT_ADMIN':
        return 'M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z';
      case 'MANAGER':
        return 'M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z';
      default:
        return 'M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z';
    }
  });
}
