import {
  ChangeDetectorRef,
  Component, computed,
  DOCUMENT,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TuiButton, TuiDataListComponent, TuiDropdown, TuiOption } from '@taiga-ui/core';
import { AuthService } from '../../services/auth/auth.service';
import { AdminService } from '../../services/admin/admin.service';
import { HealthIndicator } from '../../models/audit.model';
import { interval, startWith, Subscription, switchMap, tap } from 'rxjs';
import { ProfileService } from '../../services/profile/profile.service';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, TuiButton, ThemeToggle, TuiDropdown],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {
  private authService: AuthService = inject(AuthService);
  private adminService: AdminService = inject(AdminService);
  private profileService: ProfileService = inject(ProfileService);
  private themeService: ThemeService = inject(ThemeService);

  private fiveMinutes: number = 5 * 60 * 1000;
  private pollingSubscription!: Subscription;

  protected adminName = signal('');
  protected adminEmail = signal('');

  protected isMobileMenuOpen: boolean = false;
  protected isDesktopCollapsed = signal(false);
  protected isProfileMenuOpen = signal(false);

  protected isApiOnline = signal(true);
  protected isCheckingApi = signal(false);

  ngOnInit(): void {
    this.findAdmin();
    this.checkApiHealth();
    this.themeService.initTheme();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Mobile Menu
  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Desktop sidebar collapse
  protected toggleDesktopCollapse(): void {
    this.isDesktopCollapsed.update((val) => !val);
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
    const fullName = this.adminName();
    if (!fullName) return 'US';

    const words = fullName.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return words[0].substring(0, 2).toUpperCase();
    }
  });

  protected checkApiHealth(): void {
    this.pollingSubscription = interval(this.fiveMinutes)
      .pipe(
        startWith(0),
        tap(() => this.isCheckingApi.set(true)),
        switchMap(() => this.adminService.healthCheck()),
      )
      .subscribe({
        next: (health: HealthIndicator) => {
          this.isApiOnline.set(health.status === 'UP');
          this.isCheckingApi.set(false);
        },
        error: (error) => {
          this.isApiOnline.set(false);
          this.isCheckingApi.set(false);
        },
      });
  }

  protected findAdmin(): void {
    this.profileService.me().subscribe((admin) => {
      this.adminName.set(admin.name);
      this.adminEmail.set(admin.email);
    });
  }
}
