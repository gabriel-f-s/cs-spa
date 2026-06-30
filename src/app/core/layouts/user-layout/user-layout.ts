import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DOCUMENT,
  inject,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDropdown, TuiDataList } from '@taiga-ui/core';
import { ProfileService } from '../../services/profile/profile.service';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';

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

  protected isMobileMenuOpen = false;
  protected isProfileMenuOpen = signal(false);

  protected tenantName = signal('Tech Retail Solutions LTDA');

  protected breadcrumbs = signal<{ label: string; link?: string }[]>([]);

  protected userName = signal('');
  protected userEmail = signal('');

  ngOnInit(): void {
    this.findUser();

    this.themeService.initTheme();

    this.updateBreadcrumbs();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumbs();
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

  protected userInitials = computed(() => {
    const fullName = this.userName();
    if (!fullName) return 'US';

    const words = fullName.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return words[0].substring(0, 2).toUpperCase();
    }
  });

  // User Information
  protected findUser(): void {
    this.profileService.me().subscribe((user) => {
      this.userName.set(user.name);
      this.userEmail.set(user.email);
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
}
