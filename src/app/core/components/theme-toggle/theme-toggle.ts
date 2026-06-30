import { Component, inject, Renderer2, signal } from '@angular/core';
import { TuiButton, TuiDataListComponent, TuiDropdown, TuiOption } from '@taiga-ui/core';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [TuiButton, TuiDataListComponent, TuiOption, TuiDropdown],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  private renderer: Renderer2 = inject(Renderer2);
  private themeService: ThemeService = inject(ThemeService);

  protected isThemeMenuOpen = signal(false);

  protected isDarkTheme = signal(false);

  protected toggleThemeMenu(): void {
    this.isThemeMenuOpen.update((val) => !val);
  }

  protected closeThemeMenu(): void {
    this.isThemeMenuOpen.set(false);
  }

  protected setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(theme, this.renderer);
    this.isThemeMenuOpen.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.isDarkTheme.set(!this.themeService.isLightTheme())
    this.closeThemeMenu();
  }
}
