import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  TuiButton,
  TuiDropdown,
  TuiNotificationService,
} from '@taiga-ui/core';
import { ProfileService } from '../../services/profile/profile.service';
import { filter } from 'rxjs';
import { ThemeService } from '../../services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { TenantService } from '../../services/tenant/tenant.service';
import { UserRole } from '../../enums/user-role.enum';
import { AccessControlService } from '../../services/access-control/access-control.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageMetaService } from '../../services/utils/page-meta.service';
import { Title } from '@angular/platform-browser';
import { StringUtils } from '../../utils/string.utils';

@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, RouterModule, TuiButton, ThemeToggle, TuiDropdown],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayout implements OnInit {
  private router: Router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private profileService: ProfileService = inject(ProfileService);
  private authService: AuthService = inject(AuthService);
  private themeService: ThemeService = inject(ThemeService);
  private tenantService: TenantService = inject(TenantService);
  private pageMeta = inject(PageMetaService);
  private titleService = inject(Title);

  private alerts = inject(TuiNotificationService);
  private accessControlService = inject(AccessControlService);

  protected isMobileMenuOpen = false;
  protected isProfileMenuOpen = signal(false);

  protected tenantName = signal('');
  protected tenantPlan = signal('');
  protected logoUrl = signal('');
  protected primaryColor = signal('');
  protected secondaryColor = signal('');

  protected routeTitle = signal<string>('');
  protected displayTitle = computed(() => {
    const dynamic = this.pageMeta.dynamicTitle();
    return dynamic ? dynamic : this.routeTitle();
  });

  protected breadcrumbs = signal<{ label: string; link?: string }[]>([]);
  protected displayBreadcrumbs = computed(() => {
    const bcList = [...this.breadcrumbs()]; // Copia o array base
    const dynamicLabel = this.pageMeta.dynamicBreadcrumb();

    if (dynamicLabel && bcList.length > 0) {
      const lastIndex = bcList.length - 1;

      bcList[lastIndex] = {
        ...bcList[lastIndex],
        label: dynamicLabel,
      };
    }

    return bcList;
  });

  protected userName = signal('');
  protected userEmail = signal('');

  protected userInitials = computed(() => StringUtils.getInitials(this.userName(), 'US'));
  protected tenantInitials = computed(() => StringUtils.getInitials(this.tenantName(), 'CS'));

  // Permissions
  protected canManageUsers = computed(() => {
    const role = this.authService.getUserRole();
    return role === UserRole.TENANT_ADMIN || role === UserRole.MANAGER;
  });

  constructor() {
    this.accessControlService.accessDenied$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.alerts
        .open('Você não tem permissão para acessar este recurso.', {
          label: 'Acesso Negado',
          appearance: 'negative',
          autoClose: 4000,
        })
        .subscribe();
    });

    effect(() => {
      const currentTitle = this.displayTitle();
      if (currentTitle) {
        this.titleService.setTitle(`${currentTitle} | Controle Smart`);
      } else {
        this.titleService.setTitle('Controle Smart');
      }
    });
  }

  ngOnInit(): void {
    this.findUser();
    this.findTenant();

    this.themeService.initTheme();

    this.updateBreadcrumbs();
    this.updateRouteTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumbs();
      this.updateRouteTitle();
    });
  }

  // Mobile Menu
  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Profile Menu
  protected toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((val) => !val);
  }

  protected closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }

  // User Information
  protected findUser(): void {
    this.profileService.me().subscribe((user) => {
      this.userName.set(user.name);
      this.userEmail.set(user.email);
      this.cdr.detectChanges();
    });
  }

  // Company Information
  protected findTenant(): void {
    this.tenantService.getMyBranding().subscribe((branding) => {
      this.tenantName.set(branding.tradeName);
      this.tenantPlan.set(branding.plan);
      this.logoUrl.set(branding.logoUrl);

      const sanitizeColor = (color: string | undefined | null) => {
        if (!color) return '';
        return color.startsWith('#') ? color : `#${color}`;
      };

      const pColor = sanitizeColor(branding.primaryColor);
      const sColor = sanitizeColor(branding.secondaryColor);

      this.primaryColor.set(pColor);
      this.secondaryColor.set(sColor);

      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (pColor) {
          root.style.setProperty('--color-brand-primary', pColor);
        }
        if (sColor) {
          root.style.setProperty('--color-brand-secondary', sColor);
        }
      }

      this.cdr.detectChanges();
    });
  }

  // Breadcrumbs
  private updateBreadcrumbs(): void {
    const bc: { label: string; link?: string }[] = [{ label: 'Controle Smart', link: '/' }];

    let currentRoute = this.activatedRoute.root;
    let accumulatedUrl = '';

    while (currentRoute) {
      const childrenParts = currentRoute.snapshot.url.map((segment) => segment.path);

      if (childrenParts.length > 0) {
        accumulatedUrl += '/' + childrenParts.join('/');
      }

      const label = currentRoute.snapshot.data['breadcrumb'];
      if (label) {
        if (bc.length === 0 || bc[bc.length - 1].label !== label) {
          bc.push({
            label: label,
            link: accumulatedUrl,
          });
        }
      }

      currentRoute = currentRoute.firstChild!;
    }
    this.breadcrumbs.set(bc);
  }

  // Title
  private updateRouteTitle(): void {
    let currentRoute = this.activatedRoute.root;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const title = currentRoute.snapshot.routeConfig?.title as string;

    if (title) {
      this.routeTitle.set(title);
    }
  }
}
