import { Component, signal } from '@angular/core';
import { EqualIcon, LucideAngularModule, SunIcon, MoonIcon } from 'lucide-angular';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, ClickOutside, DropdownMenu],
  templateUrl: './header.html',
})
export class Header {
  isOpen = signal(false);

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
}
