import { Component, inject, signal } from '@angular/core';
import { EqualIcon, LucideAngularModule, SunIcon, MoonIcon } from 'lucide-angular';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { AuthService } from '@/core/services/auth.service';
import { ThemeMode, ThemeService } from '@/core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, ClickOutside, DropdownMenu],
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  currentUser = this.authService.authenticatedUser;
  themeMode = this.themeService.themeMode;

  isOpen = signal(false);

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

  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
}
