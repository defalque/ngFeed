import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'ngfeed-theme';
  private readonly systemMedia = window.matchMedia('(prefers-color-scheme: dark)');

  readonly themeMode = signal<ThemeMode>('system');
  readonly resolvedTheme = signal<ResolvedTheme>('light');

  initTheme() {
    const stored = localStorage.getItem(this.storageKey);
    const mode = this.isThemeMode(stored) ? stored : 'system';
    this.themeMode.set(mode);
    this.applyTheme(mode);
    this.bindSystemThemeListener(mode);
  }

  getTheme() {
    return this.themeMode();
  }

  setTheme(mode: ThemeMode) {
    this.themeMode.set(mode);
    localStorage.setItem(this.storageKey, mode);
    this.applyTheme(mode);
    this.bindSystemThemeListener(mode);
  }

  private applyTheme(mode: ThemeMode) {
    const resolvedTheme = this.resolveTheme(mode);
    this.resolvedTheme.set(resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }

  private resolveTheme(mode: ThemeMode): ResolvedTheme {
    if (mode === 'system') {
      return this.systemMedia.matches ? 'dark' : 'light';
    }
    return mode;
  }

  private readonly handleSystemThemeChange = () => {
    if (this.themeMode() !== 'system') {
      return;
    }
    this.applyTheme('system');
  };

  private bindSystemThemeListener(mode: ThemeMode) {
    this.systemMedia.removeEventListener('change', this.handleSystemThemeChange);
    if (mode === 'system') {
      this.systemMedia.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  private isThemeMode(mode: string | null): mode is ThemeMode {
    return mode === 'light' || mode === 'dark' || mode === 'system';
  }
}
