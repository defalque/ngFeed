import { Directive } from '@angular/core';

/*
 * Versione precedente (stessa logica):
 *
 * import { Directive, HostListener } from '@angular/core';
 *
 * @Directive({
 *   selector: 'form[appFocusField]',
 * })
 * export class FocusField {
 *   @HostListener('focusin', ['$event'])
 *   onFocusIn(event: FocusEvent) {
 *     this.onFieldFocus(event);
 *   }
 *
 *   onFieldFocus(event: FocusEvent) {
 *     const el = event.target as HTMLElement;
 *
 *     if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) {
 *       el.focus({ preventScroll: true });
 *       el.scrollIntoView({
 *         behavior: 'smooth',
 *         block: 'center',
 *       });
 *     }
 *   }
 * }
 */

const FOCUSABLE_FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'BUTTON']);

@Directive({
  selector: 'form[appFocusField]',
  standalone: true,
  host: {
    '(focusin)': 'onFocusIn($event)',
  },
})
export class FocusField {
  onFocusIn(event: FocusEvent): void {
    const el = event.target as HTMLElement;

    if (!FOCUSABLE_FIELD_TAGS.has(el.tagName)) {
      return;
    }

    el.focus({ preventScroll: true });
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
