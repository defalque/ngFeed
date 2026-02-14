import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule, XIcon } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal',
  imports: [ClickOutside, LucideAngularModule, A11yModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  title = input<string>('Modale');
  isAlert = input<boolean>(false);
  isOpen = input.required<boolean>();
  toggleFn = output<void>();

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

  readonly XIcon = XIcon;
}
