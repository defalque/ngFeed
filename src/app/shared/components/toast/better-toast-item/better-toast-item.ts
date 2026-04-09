import { Toast, ToastService } from '@/core/services/toast.service';
import { Component, computed, inject, input } from '@angular/core';
import { LucideAngularModule, LucideIconData, X } from 'lucide-angular';

@Component({
  selector: 'app-better-toast-item',
  imports: [LucideAngularModule],
  templateUrl: './better-toast-item.html',
  styleUrl: './better-toast-item.css',
})
export class BetterToastItem {
  private toastService = inject(ToastService);

  readonly toasts = computed(() => this.toastService.toasts());

  toast = input.required<Toast>();
  icon = input<LucideIconData | null>();
  index = input.required<number>();

  dismissToast(): void {
    this.toastService.dismiss(this.toast().id);
  }

  readonly XIcon = X;
}
