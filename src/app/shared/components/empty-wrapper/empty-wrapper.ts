import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'div[appEmptyWrapper]',
  imports: [],
  templateUrl: './empty-wrapper.html',
  styleUrl: './empty-wrapper.css',
  host: {
    class: 'flex flex-col justify-center items-center py-12',
    '[animate.enter]': '"empty-enter"',
    '[animate.leave]': '"empty-leave"',
  },
})
export class EmptyWrapper {}
