import { Toast } from '@/core/services/toast.service';
import { Component, effect, input, output, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Info, LucideAngularModule, LucideIconData, X } from 'lucide-angular';

@Component({
  selector: 'app-toast-item',
  imports: [A11yModule, LucideAngularModule],
  templateUrl: './toast-item.html',
  styleUrl: './toast-item.css',
  host: {
    class: 'relative',
  },
})
export class ToastItem {
  toast = input.required<Toast>();
  icon = input<LucideIconData | null>();
  dismiss = output<void>();

  isOpen = signal(true);
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
      this.dismiss.emit();
    }
  }

  closeToast() {
    this.isOpen.set(false);
  }

  readonly XIcon = X;
  readonly InfoIcon = Info;
}
