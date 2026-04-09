import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-better-toast',
  imports: [LucideAngularModule],
  templateUrl: './better-toast.html',
  styleUrl: './better-toast.css',
})
export class BetterToast {
  readonly XIcon = X;
  private nextId = 0;
  private readonly toastIds = signal<number[]>([]);

  readonly toastArray = computed(() => this.toastIds());

  addToast(): void {
    const id = this.nextId++;
    this.toastIds.update((ids) => [...ids, id]);
  }

  dismissToast(id: number): void {
    this.toastIds.update((ids) => ids.filter((i) => i !== id));
  }
}
