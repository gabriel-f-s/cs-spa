import { DOCUMENT, inject, Injectable, Renderer2, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  readonly isDarkTheme = signal(false);

  initTheme(): void {
    const savedTheme = (localStorage.getItem('cs_theme') || 'system') as
      | 'light'
      | 'dark'
      | 'system';
    this.setTheme(savedTheme);
  }

  setTheme(theme: 'light' | 'dark' | 'system', renderer?: Renderer2): void {
    const body = this.document.body;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const applyDark = theme === 'dark' || (theme === 'system' && isSystemDark);

    this.isDarkTheme.set(applyDark);

    if (renderer) {
      if (applyDark) {
        renderer.setAttribute(body, 'tuitheme', 'dark');
      } else {
        renderer.removeAttribute(body, 'tuitheme');
      }
    } else {
      if (applyDark) {
        body.setAttribute('tuitheme', 'dark');
      } else {
        body.removeAttribute('tuitheme');
      }
    }

    localStorage.setItem('cs_theme', theme);
  }

  isLightTheme(): boolean {
    return !this.isDarkTheme();
  }
}
