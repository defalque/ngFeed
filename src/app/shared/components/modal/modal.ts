import { ClickOutside } from '@/shared/directives/click-outside.directive';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule, XIcon } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';
import { ModalService } from '@/core/services/modal.service';

@Component({
  selector: 'app-modal',
  imports: [ClickOutside, LucideAngularModule, A11yModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  title = input<string>('Modale');
  isAlert = input<boolean>(false);
  isOpen = input.required<boolean>();
  toggleFn = output<void>();

  isRendered = signal(false);
  isVisible = signal(false);

  isBusy = this.modalService.isBusy;

  constructor() {
    const handler = () => this.isMobile.set(this.mobileQuery.matches);
    this.mobileQuery.addEventListener('change', handler);
    this.destroyRef.onDestroy(() =>
      this.mobileQuery.removeEventListener('change', handler)
    );

    effect(() => {
      const open = this.isOpen();

      if (open) {
        this.isDragging.set(false);
        this.tracking = false;
        this.isRendered.set(true);

        requestAnimationFrame(() => {
          this.isVisible.set(true);
        });
      } else {
        this.isDragging.set(false);
        this.tracking = false;
        this.isVisible.set(false);
        const el = this.swiperElement()?.nativeElement;
        if (el) {
          el.style.transform = '';
          el.style.transition = '';
        }
      }
    });
  }

  onClose() {
    this.toggleFn.emit();
  }

  onTransitionEnd() {
    if (!this.isVisible()) {
      this.isRendered.set(false);
    }
  }

  swiperElement = viewChild<ElementRef<HTMLDivElement>>('swiperElement');
  /** Indica se l'utente ha superato la soglia e sta trascinando attivamente il modale */
  isDragging = signal(false);
  /** Traccia se abbiamo registrato un pointer down e stiamo monitorando il movimento */
  private tracking = false;
  /** Coordinata Y iniziale del touch/click per calcolare lo spostamento */
  private startY = 0;
  /** ID del pointer attivo, usato per catturare gli eventi fino al rilascio */
  private pointerId = -1;

  /** Pixel minimi di spostamento prima di attivare il trascinamento (evita tocchi accidentali) */
  private readonly dragStartThreshold = 10;
  /** Spostamento minimo verso il basso per chiudere il modale al rilascio */
  private readonly swipeCloseThreshold = 150;

  private readonly mobileQuery = window.matchMedia('(max-width: 640px)');
  /** Reattivo al resize: la computed non si aggiornerebbe da sola perché matchMedia non è un signal */
  private isMobile = signal(this.mobileQuery.matches);
  /** Lo swipe è abilitato solo su mobile e quando non è una semplice alert */
  readonly isMobileSheet = computed(() => this.isMobile() && !this.isAlert());

  /** Alla pressione: memorizza la posizione iniziale e il pointer per il tracking (solo header) */
  onPointerDown(event: PointerEvent) {
    if (!this.isMobileSheet() || this.isBusy()) return;

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

    const el = this.swiperElement()?.nativeElement;
    if (!el) return;

    const dy = Math.max(0, event.clientY - this.startY);

    if (!this.isDragging()) {
      if (dy >= this.dragStartThreshold) {
        this.isDragging.set(true);
        el.setPointerCapture(this.pointerId);
        el.style.transition = 'none';
      }
      return;
    }

    el.style.transform = `translateY(${dy}px)`;
  }

  /**
   * Al rilascio: se lo spostamento supera la soglia, anima la chiusura e chiudi;
   * altrimenti riporta il modale alla posizione iniziale con transizione fluida.
   */
  onPointerUp() {
    this.tracking = false;

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const el = this.swiperElement()?.nativeElement;
    if (!el) return;

    const dy = parseFloat(el.style.transform.replace(/[^0-9.-]/g, '')) || 0;
    el.style.transition = '';

    if (dy >= this.swipeCloseThreshold) {
      el.style.transform = 'translateY(100%)';
      this.onClose();
    } else {
      el.style.transform = '';
    }
  }

  readonly XIcon = XIcon;
}
