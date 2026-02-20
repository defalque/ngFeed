import { Component, computed, inject } from '@angular/core';
import { ToastService, ToastType } from '@/core/services/toast.service';
import { ToastItem } from '../toast-item/toast-item';
import { LucideAngularModule, Check, X, Info, CircleAlert, CircleX } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  imports: [ToastItem, LucideAngularModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  private toastService = inject(ToastService);

  dismiss = this.toastService.dismiss.bind(this.toastService);

  toasts = computed(() => this.toastService.toasts()) ?? [];

  readonly CheckIcon = Check;
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

  onClick() {
    this.toastService.show('Errore imprevisto. Riprova più tardi.', 'neutral');
  }

  onDismiss(id: string) {
    console.log('dismissing toast', id);
    this.dismiss(id);
  }
}
