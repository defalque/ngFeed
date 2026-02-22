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

  /**
   * Inizializza il tema all'avvio dell'app.
   * - Legge la preferenza salvata da localStorage
   * - Usa 'system' se il valore salvato è invalido o mancante
   * - Applica il tema risolto al DOM
   * - Collega il listener della preferenza di sistema quando la modalità è 'system'
   */
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

  /**
   * Applica il tema al documento.
   * Risolve 'system' in chiaro/scuro in base a prefers-color-scheme,
   * aggiorna il signal resolvedTheme e attiva/disattiva la classe 'dark' su <html>.
   */
  private applyTheme(mode: ThemeMode) {
    const resolvedTheme = this.resolveTheme(mode);
    this.resolvedTheme.set(resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }

  /**
   * Converte ThemeMode in chiaro/scuro.
   * Per 'system', controlla prefers-color-scheme tramite matchMedia; altrimenti restituisce mode.
   */
  private resolveTheme(mode: ThemeMode): ResolvedTheme {
    if (mode === 'system') {
      return this.systemMedia.matches ? 'dark' : 'light';
    }
    return mode;
  }

  /** Riapplica il tema quando la preferenza del SO cambia (usato solo quando la modalità è 'system'). */
  private readonly handleSystemThemeChange = () => {
    if (this.themeMode() !== 'system') {
      return;
    }
    this.applyTheme('system');
  };

  /**
   * Gestisce il listener della preferenza di sistema.
   * Rimuove sempre prima il listener per evitare duplicati, poi lo aggiunge solo
   * quando la modalità è 'system' affinché i cambiamenti chiaro/scuro del SO siano riflessi.
   */
  private bindSystemThemeListener(mode: ThemeMode) {
    this.systemMedia.removeEventListener('change', this.handleSystemThemeChange);
    if (mode === 'system') {
      this.systemMedia.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  /** Type guard: restituisce true se il valore è un ThemeMode valido. */
  private isThemeMode(mode: string | null): mode is ThemeMode {
    return mode === 'light' || mode === 'dark' || mode === 'system';
  }
}
