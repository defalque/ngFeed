import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'div[appEmptyWrapper]',
  imports: [],
  templateUrl: './empty-wrapper.html',
  styleUrl: './empty-wrapper.css',
  host: {
    class: 'flex flex-col justify-center items-center',
    '[class.my-20]': 'layout() === "full-page"',
    '[class.mt-12]': 'layout() === "card"',
    '[animate.enter]': '"empty-enter"',
    '[animate.leave]': '"empty-leave"',
  },
})
export class EmptyWrapper {
  layout = input.required<'full-page' | 'card'>();
}
