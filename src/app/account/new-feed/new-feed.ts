import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-new-feed',
  imports: [],
  templateUrl: './new-feed.html',
  styleUrl: './new-feed.css',
})
export class NewFeed {
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
