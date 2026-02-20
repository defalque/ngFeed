import { ToastService } from '@/core/services/toast.service';
import { Component, effect, inject, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideAngularModule, XIcon } from 'lucide-angular';

@Component({
  selector: 'app-toast-item',
  imports: [A11yModule, LucideAngularModule],
  templateUrl: './toast-item.html',
  styleUrl: './toast-item.css',
})
export class ToastItem {
  private toastService = inject(ToastService);
  isOpen = signal(false);

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

  showToast() {
    this.isOpen.update((v) => !v);
  }

  readonly XIcon = XIcon;
}
