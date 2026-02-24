import { Component, input } from '@angular/core';

@Component({
  selector: 'div[appLoader]',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.aria-hidden]': 'true',
  },
})
export class Loader {
  action = input<'neutral' | 'danger'>('neutral');

  hostClasses(): string {
    const baseClasses =
      'size-5 rounded-full border-[3px] animate-spin [animation-duration:400ms]';

    const variantClasses =
      this.action() === 'neutral'
        ? 'border-black border-t-white border-r-white dark:border-white dark:border-t-black dark:border-r-black'
        : 'border-red-500 dark:border-white border-t-[3px] border-t-white dark:border-t-red-600 border-r-[3px] border-r-white dark:border-r-red-600';

    return `${baseClasses} ${variantClasses}`;
  }
}
