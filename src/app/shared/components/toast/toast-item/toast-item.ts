/**
 * Single toast UI: enter/exit animation and optional icon/close.
 * When used in the list, closing triggers closeRequest; when used in the overlay
 * with [exiting]="true", it runs the exit animation and then emits dismiss.
 */
import { Toast } from '@/core/services/toast.service';
import { Component, effect, input, output, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideAngularModule, LucideIconData, X } from 'lucide-angular';

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
  /** When true, component is in overlay playing exit animation (no close button, emits dismiss when done). */
  exiting = input(false);
  /** Emitted when user clicks close – container moves toast to overlay and runs layout transition. */
  closeRequest = output<void>();
  /** Emitted when exit transition ends – container removes toast from service. */
  dismiss = output<void>();

  /** False when we want to start the exit animation (overlay sets this after one frame). */
  isOpen = signal(true);
  /** True when the DOM for the toast should exist (avoids transitionend on unmounted node). */
  isRendered = signal(false);
  /** Drives opacity/transform classes; toggled after isRendered so transition runs. */
  isVisible = signal(false);

  /** When true, transitionend may not fire; we schedule dismiss in the effect instead. */
  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const isExiting = this.exiting();

      if (isExiting) {
        this.isRendered.set(true);
        if (open) {
          this.isVisible.set(true);
          requestAnimationFrame(() => {
            this.isOpen.set(false);
          });
        } else {
          this.isVisible.set(false);
          if (this.prefersReducedMotion) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => this.finishExit());
            });
          }
        }
        return;
      }

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

  /** On transitionend: if we're hidden, tear down DOM and notify container to remove from service. */
  onTransitionEnd() {
    if (!this.isVisible()) {
      this.finishExit();
    }
  }

  /** Tear down and notify container; used by onTransitionEnd and by reduced-motion fallback. */
  private finishExit() {
    if (!this.isRendered()) return;
    this.isRendered.set(false);
    this.dismiss.emit();
  }

  closeToast() {
    this.closeRequest.emit();
  }

  readonly XIcon = X;
}
