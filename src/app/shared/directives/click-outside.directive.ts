import { Directive, DestroyRef, ElementRef, inject, input, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appClickOutsideDropdown]',
})
export class ClickOutside {
  private elementRef = inject(ElementRef);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  enabled = input(true, { alias: 'clickOutsideEnabled' });
  onClickOutside = output<void>();

  constructor() {
    const onClickDocument = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickedInside = this.elementRef.nativeElement.contains(target);

      if (this.enabled() && !clickedInside) {
        this.onClickOutside.emit();
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (this.enabled() && event.key === 'Escape') {
        this.onClickOutside.emit();
      }
    };

    this.document.addEventListener('click', onClickDocument, true);
    this.document.addEventListener('keydown', onKeydown);

    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('click', onClickDocument, true);
      this.document.removeEventListener('keydown', onKeydown);
    });
  }
}
