import { ClickOutside } from '@/shared/directives/click-outside.directive';
import {
  Component,
  computed,
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

  title = input<string>('Modale');
  isAlert = input<boolean>(false);
  isOpen = input.required<boolean>();
  toggleFn = output<void>();

  isRendered = signal(false);
  isVisible = signal(false);

  isBusy = this.modalService.isBusy;

  constructor() {
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
  isDragging = signal(false);
  private tracking = false;
  private startY = 0;
  private pointerId = -1;

  private readonly dragStartThreshold = 10;
  private readonly swipeCloseThreshold = 150;
  private readonly mobileQuery = window.matchMedia('(max-width: 640px)');

  readonly isMobileSheet = computed(() => this.mobileQuery.matches && !this.isAlert());

  onPointerDown(event: PointerEvent) {
    if (!this.isMobileSheet()) return;
    this.tracking = true;
    this.startY = event.clientY;
    this.pointerId = event.pointerId;
  }

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
