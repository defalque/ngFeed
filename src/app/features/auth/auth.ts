import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from '@/core/services/auth.service';
import { finalize, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Button } from '@/shared/components/button/button';
import { Check, Copy, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { FocusField } from '@/shared/directives/focus-field.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Loader } from '@/shared/components/loader/loader';

@Component({
  selector: 'app-auth',
  imports: [A11yModule, FormsModule, Button, LucideAngularModule, FocusField, Loader],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoginMode = signal(true);

  isLoading = signal(false);

  error = signal('');

  switchMode() {
    if (this.isLoading()) return;

    this.isLoginMode.update((prev) => !prev);
  }

  onSubmit(formData: NgForm) {
    this.error.set('');
    if (formData.invalid) return;

    const email = (formData.value.email ?? '').trim();
    const password = (formData.value.password ?? '').trim();

    if (!email || !password) return;

    let authObs: Observable<AuthResponseData>;

    this.isLoading.set(true);
    if (this.isLoginMode()) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    authObs
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          formData.reset();
          this.router.navigate(['/per-te']);
        },
        error: (err: Error) => {
          this.error.set(err.message);
        },
      });
  }

  passwordVisible = signal(false);
  togglePasswordVisibility() {
    this.passwordVisible.set(!this.passwordVisible());
  }

  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CopyIcon = Copy;
  readonly CheckIcon = Check;

  emailCopied = signal(false);
  passwordCopied = signal(false);

  /** Salta enter animation quando gli hint appaiono (load o switch a login), anima solo sul toggle delle icone */
  skipEnterAnimation = signal(true);

  constructor() {
    effect(() => {
      if (this.isLoginMode()) this.skipEnterAnimation.set(true);
    });
  }

  copyEmail() {
    this.skipEnterAnimation.set(false);
    navigator.clipboard.writeText('test@example.com').then(() => {
      this.emailCopied.set(true);
      setTimeout(() => this.emailCopied.set(false), 1500);
    });
  }

  copyPassword() {
    this.skipEnterAnimation.set(false);
    navigator.clipboard.writeText('123456').then(() => {
      this.passwordCopied.set(true);
      setTimeout(() => this.passwordCopied.set(false), 1500);
    });
  }
}
