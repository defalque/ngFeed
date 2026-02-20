import { Injectable, signal } from '@angular/core';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'neutral';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType) {
    const id = crypto.randomUUID();
    this.toasts.set([...this.toasts(), { id, message, type }]);
    return id;
  }

  dismissAll() {
    this.toasts.set([]);
  }

  dismiss(id: string) {
    this.toasts.set(this.toasts().filter((toast) => toast.id !== id));
  }
}
