import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-update',
  imports: [],
  templateUrl: './update.html',
  styleUrl: './update.css',
})
export class Update {
  onFieldFocus(event: FocusEvent) {
    const el = event.target as HTMLElement;

    if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
