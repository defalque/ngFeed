import { Component, inject, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from '@/core/services/auth.service';
import { finalize, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [A11yModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  host: { class: 'block w-full' },
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);

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
        finalize(() => {
          this.isLoading.set(false);
          formData.reset();
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/per-te']);
        },
        error: (err: Error) => {
          this.error.set(err.message);
        },
      });
  }
}
