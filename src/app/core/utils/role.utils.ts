import { UserRole } from '../enums/user-role.enum';

export class RoleUtils {
  static readonly VIEW_ADMIN = 'Administrador';
  static readonly VIEW_MANAGER = 'Gerente';
  static readonly VIEW_OPERATOR = 'Operador';

  /**
   * Converte a string da tela (ex: "Administrador") para o Enum da API
   */
  static mapRoleToApi(roleView: string): string {
    switch (roleView) {
      case this.VIEW_ADMIN:
        return UserRole.TENANT_ADMIN;
      case this.VIEW_MANAGER:
        return UserRole.MANAGER;
      case this.VIEW_OPERATOR:
        return UserRole.OPERATOR;
      default:
        return UserRole.OPERATOR;
    }
  }

  /**
   * Converte o Enum da API (ex: "MANAGER") para a string da tela
   */
  static mapRoleToView(roleApi: string): string {
    switch (roleApi) {
      case UserRole.TENANT_ADMIN:
        return this.VIEW_ADMIN;
      case UserRole.MANAGER:
        return this.VIEW_MANAGER;
      case UserRole.OPERATOR:
        return this.VIEW_OPERATOR;
      default:
        return this.VIEW_OPERATOR;
    }
  }

  /**
   * Retorna os cargos disponíveis para seleção baseados na hierarquia do usuário logado.
   * Admin vê tudo. Manager vê apenas Manager e Operator.
   */
  static getAvailableRoles(currentUserRole: string): string[] {
    if (currentUserRole === UserRole.TENANT_ADMIN) {
      return [this.VIEW_ADMIN, this.VIEW_MANAGER, this.VIEW_OPERATOR];
    }
    if (currentUserRole === UserRole.MANAGER) {
      return [this.VIEW_MANAGER, this.VIEW_OPERATOR];
    }
    return [];
  }
}
