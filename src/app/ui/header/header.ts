import { Component, signal } from '@angular/core';
import { EqualIcon, LucideAngularModule, SunIcon, MoonIcon } from 'lucide-angular';
import { ClickOutside } from '@/click-outside.directive';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, ClickOutside],
  templateUrl: './header.html',
})
export class Header {
  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
  isOpen = signal(false);

  toggleOpen() {
    console.log('toggleOpen', this.isOpen());
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
