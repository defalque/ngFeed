import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from '@/core/services/auth.service';
import { finalize, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Button } from '@/shared/components/button/button';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
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

    const email = formData.value.email.trim();
    const password = formData.value.password.trim();

    let authObs: Observable<AuthResponseData>;

    this.isLoading.set(true);
    if (this.isLoginMode()) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    authObs
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
        }),
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
}
