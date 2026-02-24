import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  private readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('buttonRef');
  get elementRef(): ElementRef<HTMLButtonElement> {
    return this.buttonRef();
  }

  variant = input<'primary' | 'reset' | 'form-submit' | 'form-reset'>('primary');
  disabled = input(false);
  size = input<'sm' | 'md' | 'lg'>('md');
  ariaLabel = input<string | null>(null);
  twStyles = input<string>('');
  onClick = output<void>();

  protected type = computed(() => {
    const v = this.variant();
    return v === 'form-submit' ? 'submit' : v === 'reset' ? 'reset' : 'button';
  });

  private primaryButtonColors =
    'bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 disabled:hover:bg-black dark:disabled:hover:bg-white';
  private resetButtonColors =
    'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:hover:bg-gray-100 dark:disabled:hover:bg-zinc-800 text-black/80 dark:text-white/80';

  protected buttonClasses = computed(() => {
    const sizeClasses =
      this.size() === 'sm'
        ? 'px-2 py-1 text-sm font-medium'
        : this.size() === 'md'
          ? 'px-4 py-2 text-base font-semibold'
          : 'px-5 py-2.5 text-base sm:text-lg font-semibold';
    const variantClasses =
      this.variant() === 'form-submit'
        ? `${this.primaryButtonColors} mt-2 w-full rounded-xl`
        : this.variant() === 'form-reset'
          ? `${this.resetButtonColors} w-full rounded-xl`
          : this.variant() === 'reset'
            ? `${this.resetButtonColors} rounded-md`
            : `${this.primaryButtonColors} rounded-md`;

    return `cursor-pointer transition-all duration-300 active:scale-[0.97] text-shadow-2xs dark:text-shadow-none focus-button flex items-center gap-2 justify-center disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClasses} ${variantClasses} ${this.twStyles()}`;
  });
}
