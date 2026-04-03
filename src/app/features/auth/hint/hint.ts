import { Component, input, signal } from '@angular/core';
import { Check, Copy, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-hint',
  imports: [LucideAngularModule],
  templateUrl: './hint.html',
  styleUrl: './hint.css',
})
export class Hint {
  fieldValue = input.required<string>();

  readonly CopyIcon = Copy;
  readonly CheckIcon = Check;

  fieldCopied = signal(false);

  /** Salta enter animation quando gli hint appaiono (load o switch a login), anima solo sul toggle delle icone */
  skipEnterAnimation = signal(true);

  copyField() {
    this.skipEnterAnimation.set(false);
    navigator.clipboard.writeText(this.fieldValue()).then(() => {
      this.fieldCopied.set(true);
      setTimeout(() => this.fieldCopied.set(false), 1500);
    });
  }
}
