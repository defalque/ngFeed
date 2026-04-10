import { ToastService, ToastType } from '@/core/services/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { CircleCheck, Info, CircleAlert, CircleX, LucideAngularModule, X } from 'lucide-angular';
import { BetterToastItem } from '../better-toast-item/better-toast-item';

/** Spazio verticale in px tra un toast e l'altro */
const GAP = 16;

@Component({
  selector: 'app-better-toast',
  imports: [LucideAngularModule, BetterToastItem],
  templateUrl: './better-toast.html',
  styleUrl: './better-toast.css',
})
export class BetterToast {
  private toastService = inject(ToastService);

  readonly toasts = computed(() => this.toastService.toasts());

  /** Registro delle altezze misurate di ogni toast (id → altezza in px) */
  readonly heights = signal<Record<string, number>>({});

  /*
   * ── Expand/Collapse (Sonner-style) ─────────────────────────────────
   * Per abilitare il comportamento stacked → expanded on hover:
   *
   * 1. Aggiungere a imports: effect
   *    import { Component, computed, effect, inject, signal } from '@angular/core';
   *
   * 2. Aggiungere queste proprietà:
   *    readonly expanded = signal(false);
   *    readonly interacting = signal(false);
   *    readonly GAP = GAP;
   *
   * 3. Aggiungere un constructor con effect:
   *    constructor() {
   *      effect(() => {
   *        if (this.toasts().length <= 1) {
   *          this.expanded.set(false);
   *        }
   *      });
   *    }
   *
   * 4. Aggiungere il computed frontToastHeight:
   *    readonly frontToastHeight = computed(() => {
   *      const toastsList = this.toasts();
   *      const heights = this.heights();
   *      for (let i = toastsList.length - 1; i >= 0; i--) {
   *        const h = heights[toastsList[i].id];
   *        if (h != null && h > 0) return h;
   *      }
   *      return 0;
   *    });
   *
   * 5. Aggiungere il metodo onMouseLeave:
   *    onMouseLeave() {
   *      if (!this.interacting()) {
   *        this.expanded.set(false);
   *      }
   *    }
   * ────────────────────────────────────────────────────────────────────
   */

  /**
   * Calcola l'offset verticale (in px) di ciascun toast.
   * Itera dal più recente (in fondo all'array) al più vecchio:
   * il toast più recente ha offset 0 (resta ancorato al bordo),
   * ogni toast precedente accumula la somma delle altezze reali
   * dei toast sottostanti + il gap tra ciascuno di essi.
   */
  readonly offsets = computed(() => {
    const toastsList = this.toasts();
    const heights = this.heights();
    const result: Record<string, number> = {};
    let cumulative = 0;

    for (let i = toastsList.length - 1; i >= 0; i--) {
      const toast = toastsList[i];
      result[toast.id] = cumulative;
      cumulative += (heights[toast.id] ?? 0) + GAP;
    }

    return result;
  });

  /** Aggiorna il registro quando un toast comunica la propria altezza */
  onHeightChange(toastId: string, height: number) {
    this.heights.update((h) => ({ ...h, [toastId]: height }));
  }

  dismissToast(id: string) {
    this.toastService.dismiss(id);
  }

  readonly CheckIcon = CircleCheck;
  readonly XIcon = X;
  readonly InfoIcon = Info;
  readonly CircleAlertIcon = CircleAlert;
  readonly CircleXIcon = CircleX;

  getIcon(type: ToastType) {
    switch (type) {
      case 'success':
        return this.CheckIcon;
      case 'error':
        return this.CircleXIcon;
      case 'info':
        return this.InfoIcon;
      case 'warning':
        return this.CircleAlertIcon;
      case 'neutral':
        return null;
    }
  }
}
