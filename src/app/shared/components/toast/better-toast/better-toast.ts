import { ToastService, ToastType } from '@/core/services/toast.service';
import { Component, computed, inject } from '@angular/core';
import { CircleCheck, Info, CircleAlert, CircleX, LucideAngularModule, X } from 'lucide-angular';
import { BetterToastItem } from '../better-toast-item/better-toast-item';

@Component({
  selector: 'app-better-toast',
  imports: [LucideAngularModule, BetterToastItem],
  templateUrl: './better-toast.html',
  styleUrl: './better-toast.css',
})
export class BetterToast {
  private toastService = inject(ToastService);

  readonly toasts = computed(() => this.toastService.toasts());

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
