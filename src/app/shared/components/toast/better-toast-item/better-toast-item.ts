import { Toast, ToastService, ToastType } from '@/core/services/toast.service';
import { Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { LucideAngularModule, LucideIconData, X } from 'lucide-angular';

@Component({
  selector: 'app-better-toast-item',
  imports: [LucideAngularModule],
  templateUrl: './better-toast-item.html',
  styleUrl: './better-toast-item.css',
  host: {
    role: 'listitem',
    tabindex: '0',
    class:
      'w-full md:w-89 p-4 origin-bottom bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-300/80 dark:border-zinc-800 shadow-md dark:shadow-black rounded-md absolute bottom-0 right-0 text-sm text-left toast block',
    '[style.--index]': 'index()',
    '[animate.leave]': '"leave"',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(pointercancel)': 'onPointerCancel()',
  },
})
export class BetterToastItem {
  private toastService = inject(ToastService);
  private host = inject(ElementRef<HTMLElement>);

  toast = input.required<Toast>();
  icon = input<LucideIconData | null>();
  index = input.required<number>();

  dismissToast(id: string): void {
    this.toastService.dismiss(id);
  }

  /** Indica se l'utente ha superato la soglia e sta trascinando attivamente il modale */
  isDragging = signal(false);
  /** Traccia se abbiamo registrato un pointer down e stiamo monitorando il movimento */
  private tracking = false;
  /** Coordinata Y iniziale del touch/click per calcolare lo spostamento */
  private startY = 0;
  /** ID del pointer attivo, usato per catturare gli eventi fino al rilascio */
  private pointerId = -1;
  /** Pixel minimi di spostamento prima di attivare il trascinamento (evita tocchi accidentali) */
  private readonly dragStartThreshold = 0;
  /** Spostamento minimo verso il basso per chiudere il modale al rilascio */
  private readonly swipeCloseThreshold = 30;

  /** Alla pressione: memorizza la posizione iniziale e il pointer per il tracking*/
  onPointerDown(event: PointerEvent) {
    this.tracking = true;
    this.startY = event.clientY;
    this.pointerId = event.pointerId;
  }

  /**
   * Durante il movimento: se lo spostamento supera la soglia, attiva il drag e
   * aggiorna translateY per seguire il dito. Solo verso il basso (dy >= 0).
   */
  onPointerMove(event: PointerEvent) {
    if (!this.tracking && !this.isDragging()) return;

    const el = this.host.nativeElement;
    const dy = Math.max(0, event.clientY - this.startY);

    if (!this.isDragging()) {
      if (dy >= this.dragStartThreshold) {
        this.isDragging.set(true);
        el.setPointerCapture(this.pointerId);
      }
      return;
    }

    el.style.translate = `0 ${dy}px`;
  }

  /**
   * Al rilascio: se lo spostamento supera la soglia, anima la chiusura e chiudi;
   * altrimenti riporta il toast alla posizione iniziale con transizione fluida.
   */
  onPointerUp() {
    this.tracking = false;

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const el = this.host.nativeElement;
    const id = this.toast().id;

    const dy = parseFloat(el.style.translate?.split(' ')[1]) || 0;

    try {
      el.releasePointerCapture(this.pointerId);
    } catch {
      /* pointer già rilasciato */
    }

    if (dy >= this.swipeCloseThreshold) {
      el.style.transform = 'translateY(130%)';
      this.dismissToast(id);
    } else {
      el.style.transition = 'translate 400ms ease';
      el.style.translate = '0 0';
      // Rimuove gli stili inline dopo l'animazione per non interferire con le transition CSS successive
      const cleanup = () => {
        el.style.transition = '';
        el.style.translate = '';
      };
      el.addEventListener('transitionend', cleanup, { once: true });
      setTimeout(cleanup, 450); // fallback se transitionend non scatta
    }
  }

  /** Annulla il drag e riporta il toast alla posizione originale senza animazione */
  onPointerCancel() {
    this.tracking = false;

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const el = this.host.nativeElement;
    el.style.translate = '';

    try {
      el.releasePointerCapture(this.pointerId);
    } catch {
      /* pointer già rilasciato */
    }
  }

  readonly XIcon = X;
}
