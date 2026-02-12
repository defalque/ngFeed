import { ClickOutside } from '@/click-outside.directive';
import { Component, input, output } from '@angular/core';
import { LucideAngularModule, XIcon } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal',
  imports: [ClickOutside, LucideAngularModule, A11yModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  title = input<string>('Modale');
  isOpen = input.required<boolean>();
  toggleFn = output<void>();

  readonly XIcon = XIcon;
}
