import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  ArrowLeftIcon,
  EqualIcon,
  LucideAngularModule,
  MoonIcon,
  SunIcon,
} from 'lucide-angular';
import { filter, map } from 'rxjs';
import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { AuthService } from '@/core/services/auth.service';
import { ThemeMode, ThemeService } from '@/core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, ClickOutsideDirective, DropdownMenu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private location = inject(Location);

  currentUser = this.authService.authenticatedUser;
  themeMode = this.themeService.themeMode;

  isOpen = signal(false);

  /**
   * `true` se l'URL è la pagina singolo post (`utente/:id/posts/:postId` in app.routes).
   *
   * - `toSignal`: trasforma un Observable in Signal così il template può usare `isFullPostPage()`.
   * - `router.events`: flusso di tutti gli eventi di navigazione (inizio, fine, errore, …).
   * - `filter(NavigationEnd)`: teniamo solo “navigazione completata”, quando `router.url` è già aggiornato.
   * - `map(...)`: ad ogni fine navigazione ricalcoliamo se il path corrente è quello della full post.
   * - `initialValue`: primo valore del signal prima della prima emissione (es. primo paint), così non resta mai “vuoto”.
   */
  readonly isFullPostPage = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.matchesFullPostPath()),
    ),
    { initialValue: this.matchesFullPostPath() },
  );

  logUserOut(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.logout();
    this.toggleOpen();
  }

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  setTheme(mode: ThemeMode) {
    this.themeService.setTheme(mode);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigateByUrl('/per-te');
    }
  }

  private matchesFullPostPath(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return /^\/utente\/[^/]+\/posts\/[^/]+$/.test(path);
  }

  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
}
