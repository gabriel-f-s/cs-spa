import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PageMetaService {
  public dynamicTitle = signal<string | null>(null);
  public dynamicBreadcrumb = signal<string | null>(null);

  public setMeta(title: string, breadcrumb?: string): void {
    this.dynamicTitle.set(title);
    this.dynamicBreadcrumb.set(breadcrumb || title);
  }

  public reset(): void {
    this.dynamicTitle.set(null);
    this.dynamicBreadcrumb.set(null);
  }
}
