import { Injectable, signal } from '@angular/core';

const TOAST_EXPIRE_MS = 5000;

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'neutral';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  /** Timer handles for cleanup when toast is dismissed before expire. */
  private expireTimers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType) {
    const id = crypto.randomUUID();
    this.toasts.set([...this.toasts(), { id, message, type }]);

    const timerId = setTimeout(() => {
      this.dismiss(id);
    }, TOAST_EXPIRE_MS);
    this.expireTimers.set(id, timerId);

    return id;
  }

  dismissAll() {
    this.clearAllTimers();
    this.toasts.set([]);
  }

  dismiss(id: string) {
    this.clearTimer(id);
    this.toasts.set(this.toasts().filter((toast) => toast.id !== id));
  }

  private clearTimer(id: string): void {
    const timerId = this.expireTimers.get(id);
    if (timerId != null) {
      clearTimeout(timerId);
      this.expireTimers.delete(id);
    }
  }

  private clearAllTimers(): void {
    for (const timerId of this.expireTimers.values()) {
      clearTimeout(timerId);
    }
    this.expireTimers.clear();
  }
}
