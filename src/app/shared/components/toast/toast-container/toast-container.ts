/**
 * Toast container: holds the list of toasts and an overlay for the one exiting.
 * Uses FLIP animation (First–Last–Invert–Play) in ngAfterViewChecked so that
 * when a toast is removed, the remaining toasts animate smoothly to their new positions.
 *
 * Performance note: ngAfterViewChecked runs after every change detection. FLIP work
 * is only done when the slot count changes and we have previous positions; consider
 * running FLIP from an effect that depends on displayToasts() if this ever becomes hot.
 */
import {
  AfterViewChecked,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Toast, ToastService, ToastType } from '@/core/services/toast.service';
import { ToastItem } from '../toast-item/toast-item';
import { LucideAngularModule, CircleCheck, X, Info, CircleAlert, CircleX } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  imports: [ToastItem, LucideAngularModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer implements AfterViewChecked {
  /** Refs to each list item wrapper; used to read positions for FLIP and to drive layout. */
  @ViewChildren('toastSlot') private toastSlots!: QueryList<ElementRef<HTMLElement>>;

  private toastService = inject(ToastService);
  /** Number of toast slots in the previous run; used to detect add/remove for FLIP. */
  private prevSlotCount = 0;
  /** Previous top position (getBoundingClientRect().top) per toast id for FLIP delta. */
  private prevTopsById = new Map<string, number>();

  /** Toast currently playing exit animation in overlay (excluded from list so others slide immediately). */
  protected exitingToast = signal<{ toast: Toast; bounds: DOMRect } | null>(null);

  /** Bound dismiss for template or overlay; removes a toast from the service. */
  dismiss = this.toastService.dismiss.bind(this.toastService);

  /** Live list of toasts from the service (source of truth). */
  toasts = computed(() => this.toastService.toasts());

  /** List for layout: excludes the exiting toast so remaining toasts reflow and FLIP runs. */
  protected displayToasts = computed(() => {
    const ex = this.exitingToast();
    const list = this.toasts();
    if (!ex) return list;
    return list.filter((t) => t.id !== ex.toast.id);
  });

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

  // onClick() {
  //   this.toastService.show('Errore imprevisto. Riprova più tardi.', 'info');
  // }

  /**
   * Called when the user closes a toast. Captures its position, moves it into
   * exitingToast (overlay) so the list reflows and FLIP can run on the rest.
   */
  onCloseRequest(id: string): void {
    const list = this.toasts();
    const slots = this.toastSlots?.toArray() ?? [];
    const index = list.findIndex((t) => t.id === id);
    if (index === -1 || index >= slots.length) return;
    const bounds = slots[index].nativeElement.getBoundingClientRect();
    const toast = list.find((t) => t.id === id)!;
    this.exitingToast.set({ toast, bounds });
  }

  /** Called when the toast in the overlay finishes its exit transition; removes it from the service. */
  onExitingDismiss(): void {
    const ex = this.exitingToast();
    if (ex) {
      this.dismiss(ex.toast.id);
      this.exitingToast.set(null);
    }
  }

  /**
   * FLIP animation: after each view check we compare current slot positions to previous.
   * If the slot count changed, we apply a one-frame “invert” (translate by delta) then
   * animate back to 0 so toasts slide into place when one is removed.
   */
  ngAfterViewChecked(): void {
    const slots = this.toastSlots?.toArray() ?? [];
    const count = slots.length;
    const list = this.displayToasts();
    if (count === 0) {
      this.prevSlotCount = 0;
      this.prevTopsById.clear();
      return;
    }

    const currentTops = slots.map((ref) => ref.nativeElement.getBoundingClientRect().top);
    const countChanged = count !== this.prevSlotCount;

    if (countChanged && this.prevTopsById.size > 0) {
      const toAnimate: number[] = [];
      for (let i = 0; i < slots.length; i++) {
        const id = list[i].id;
        const prevTop = this.prevTopsById.get(id);
        const currentTop = currentTops[i];
        if (prevTop !== undefined && prevTop !== currentTop) {
          const el = slots[i].nativeElement;
          const delta = prevTop - currentTop;
          el.style.transition = 'none';
          el.style.transform = `translateY(${delta}px)`;
          toAnimate.push(i);
        }
      }
      requestAnimationFrame(() => {
        for (const i of toAnimate) {
          const el = slots[i].nativeElement;
          el.style.transition = 'transform 0.3s ease-out';
          el.style.transform = 'translateY(0)';
        }
      });
    }

    this.prevSlotCount = count;
    this.prevTopsById.clear();
    for (let i = 0; i < count; i++) {
      this.prevTopsById.set(list[i].id, currentTops[i]);
    }
  }
}
