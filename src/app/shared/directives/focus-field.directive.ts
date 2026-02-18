import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'form[appFocusField]',
})
export class FocusField {
  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent) {
    this.onFieldFocus(event);
  }

  onFieldFocus(event: FocusEvent) {
    const el = event.target as HTMLElement;

    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
