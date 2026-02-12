import { ClickOutside } from '@/click-outside.directive';
import { Component, input, output } from '@angular/core';
import { LucideAngularModule, XIcon } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  imports: [ClickOutside, LucideAngularModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  isOpen = input.required<boolean>();
  toggleFn = output<void>();

  readonly XIcon = XIcon;
}
