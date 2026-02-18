import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.css',
})
export class DropdownMenu {
  isOpen = input.required<boolean>();
  usedIn = input.required<'navbar' | 'header' | 'post-options'>();
  isCurrentUserPost = input<boolean>(false);

  isRendered = signal(false);
  isVisible = signal(false);

  constructor() {
    effect(() => {
      const open = this.isOpen();

      if (open) {
        this.isRendered.set(true);

        requestAnimationFrame(() => {
          this.isVisible.set(true);
        });
      } else {
        this.isVisible.set(false);
      }
    });
  }

  onTransitionEnd() {
    if (!this.isVisible()) {
      this.isRendered.set(false);
    }
  }
}
