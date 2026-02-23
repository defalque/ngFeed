import { UserService } from '@/core/services/user.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, first, map, of } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { ModalService } from '@/core/services/modal.service';
import { AuthService } from '@/core/services/auth.service';
import { EditedUser } from '@/core/types/user.model';
// import { Router } from '@angular/router';
import { FocusField } from '@/shared/directives/focus-field.directive';
import { NgOptimizedImage } from '@angular/common';
import { ToastService } from '@/core/services/toast.service';
import { Button } from '@/shared/components/button/button';

function validUrl(control: AbstractControl) {
  if (!control.value) return null;

  try {
    const url = new URL(control.value);
    return url.protocol === 'https:' ? null : { invalidProtocol: true };
  } catch {
    return { invalidUrl: true };
  }
}

function isUsernameUnique(userService: UserService, currentUsername?: string): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return of(null);

    // Se l'utente non ha cambiato il suo username, è valido di default
    if (control.value === currentUsername) return of(null);

    return userService.checkUniqueUsername(control.value).pipe(
      map((isTaken) => (isTaken ? { notUnique: true } : null)),
      first(),
    );
  };
}

function equalValues(controlName1: string, controlName2: string) {
  return (control: AbstractControl) => {
    const control1 = control.get(controlName1)?.value;
    const control2 = control.get(controlName2)?.value;

    if (control1 === control2) return { valuesAreEquals: true };

    return null;
  };
}

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, A11yModule, FocusField, NgOptimizedImage, Button],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUser implements OnInit {
  // private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  submitBtn = viewChild(Button);

  authenticatedUser = this.authService.authenticatedUser;
  currentUser = this.userService.loadedCurrentUser;

  initialFormValue!: any;

  reactiveForm = new FormGroup({
    info: new FormGroup(
      {
        firstName: new FormControl('', {
          validators: [Validators.required, Validators.minLength(2)],
        }),
        lastName: new FormControl('', {
          validators: [Validators.required, Validators.minLength(2)],
        }),
      },
      {
        validators: [equalValues('firstName', 'lastName')],
      },
    ),
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      asyncValidators: [isUsernameUnique(this.userService, this.currentUser()?.username)],
      updateOn: 'blur',
    }),
    avatar: new FormControl('', {
      validators: [validUrl],
    }),
    bio: new FormControl('', {
      validators: [Validators.minLength(2)],
    }),
    websiteUrl: new FormControl('', {
      validators: [validUrl],
    }),
    location: new FormControl('', {
      validators: [Validators.minLength(2)],
    }),
    isVerified: new FormControl(false),
  });

  ngOnInit(): void {
    if (this.authenticatedUser()) {
      this.reactiveForm.patchValue({
        // Mappiamo i dati flat nel gruppo 'info'
        info: {
          firstName: this.currentUser()?.firstName,
          lastName: this.currentUser()?.lastName,
        },
        // Gli altri campi coincidono, quindi passano direttamente
        username: this.currentUser()?.username,
        avatar: this.currentUser()?.avatar,
        bio: this.currentUser()?.bio,
        websiteUrl: this.currentUser()?.websiteUrl,
        location: this.currentUser()?.location,
        isVerified: this.currentUser()?.isVerified,
      });

      this.initialFormValue = this.reactiveForm.getRawValue();
      this.reactiveForm.markAsPristine();
    }
  }

  isUnchanged(): boolean {
    if (!this.currentUser()) return false;

    const currentValue = this.reactiveForm.getRawValue();
    return JSON.stringify(currentValue) === JSON.stringify(this.initialFormValue);
  }

  get infoAreInvalid() {
    return (
      this.reactiveForm.controls.info.touched &&
      this.reactiveForm.controls.info.dirty &&
      this.reactiveForm.controls.info.invalid &&
      this.reactiveForm.controls.info.errors?.['valuesAreEquals']
    );
  }

  get firstNameIsInvalid() {
    return (
      this.reactiveForm.controls.info.controls.firstName.touched &&
      this.reactiveForm.controls.info.controls.firstName.dirty &&
      this.reactiveForm.controls.info.controls.firstName.invalid
    );
  }

  get lastNameIsInvalid() {
    return (
      this.reactiveForm.controls.info.controls.lastName.touched &&
      this.reactiveForm.controls.info.controls.lastName.dirty &&
      this.reactiveForm.controls.info.controls.lastName.invalid
    );
  }

  get usernameIsInvalid() {
    return (
      this.reactiveForm.controls.username.touched &&
      this.reactiveForm.controls.username.dirty &&
      this.reactiveForm.controls.username.invalid
    );
  }

  firstNameAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.firstNameIsInvalid) ids.push('firstName-error');
    if (this.infoAreInvalid) ids.push('info-error');
    return ids.length > 0 ? ids.join(' ') : null;
  }

  lastNameAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.lastNameIsInvalid) ids.push('lastName-error');
    if (this.infoAreInvalid) ids.push('info-error');
    return ids.length > 0 ? ids.join(' ') : null;
  }

  get avatarIsInvalid() {
    return (
      this.reactiveForm.controls.avatar.touched &&
      this.reactiveForm.controls.avatar.dirty &&
      this.reactiveForm.controls.avatar.invalid
    );
  }

  get avatarUrl(): string {
    const value = this.reactiveForm.controls.avatar.value;
    const defaultAvatar = '/assets/images/default-user.avif';

    // Mostra l'avatar inserito solo se il campo è valido e non vuoto
    return value && !this.avatarIsInvalid ? value : defaultAvatar;
  }

  get bioIsInvalid() {
    return (
      this.reactiveForm.controls.bio.touched &&
      this.reactiveForm.controls.bio.dirty &&
      this.reactiveForm.controls.bio.invalid
    );
  }

  get websiteUrlIsInvalid() {
    return (
      this.reactiveForm.controls.websiteUrl.touched &&
      this.reactiveForm.controls.websiteUrl.dirty &&
      this.reactiveForm.controls.websiteUrl.errors?.['invalidUrl']
    );
  }

  get locationIsInvalid() {
    return (
      this.reactiveForm.controls.location.touched &&
      this.reactiveForm.controls.location.dirty &&
      this.reactiveForm.controls.location.invalid
    );
  }

  isEditing = signal(false);

  private readonly invalidFieldIds = [
    'firstName',
    'lastName',
    'username',
    'avatar',
    'bio',
    'website',
    'location',
  ] as const;

  private focusFirstInvalidField(): void {
    const { info, username, avatar, bio, websiteUrl, location } = this.reactiveForm.controls;

    const invalidById = (id: string) => {
      switch (id) {
        case 'firstName':
        case 'lastName':
          return info.invalid;
        case 'username':
          return username.invalid;
        case 'avatar':
          return avatar.invalid;
        case 'bio':
          return bio.invalid;
        case 'website':
          return websiteUrl.invalid;
        case 'location':
          return location.invalid;
        default:
          return false;
      }
    };

    for (const id of this.invalidFieldIds) {
      if (invalidById(id)) {
        document.getElementById(id)?.focus();
        return;
      }
    }
  }

  onReset() {
    if (this.isEditing() || this.isUnchanged()) return;

    if (this.currentUser()) {
      const user = this.currentUser();
      this.reactiveForm.reset({
        info: {
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
        username: user?.username,
        bio: user?.bio,
        websiteUrl: user?.websiteUrl,
        location: user?.location,
        isVerified: user?.isVerified,
      });
    } else {
      this.reactiveForm.reset();
    }
  }

  onSubmit() {
    if (this.isEditing() || this.isUnchanged()) return;

    if (this.reactiveForm.invalid) {
      this.reactiveForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const btn = this.submitBtn();

    if (btn) {
      btn.elementRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    const newUserData: EditedUser = {
      firstName: this.reactiveForm.controls.info.controls.firstName.value!,
      lastName: this.reactiveForm.controls.info.controls.lastName.value!,
      username: this.reactiveForm.controls.username.value!,
      avatar: this.reactiveForm.controls.avatar.value!,
      bio: this.reactiveForm.controls.bio.value!,
      websiteUrl: this.reactiveForm.controls.websiteUrl.value!,
      location: this.reactiveForm.controls.location.value!,
      isVerified: this.reactiveForm.controls.isVerified.value!,
    };

    if (!this.currentUser()) {
      this.reactiveForm.disable();

      this.isEditing.set(true);
      this.userService
        .createAuthUserInfo(newUserData)
        .pipe(
          finalize(() => {
            this.isEditing.set(false);
            this.modalService.closeDialog();
            this.reactiveForm.enable();
          }),
        )
        .subscribe({
          next: () => {
            this.toastService.show('Profilo creato con successo', 'success');
          },
          error: (err) => {
            this.toastService.show(err.message, 'error');
          },
        });
    } else {
      this.reactiveForm.disable();

      this.isEditing.set(true);
      this.userService
        .updateAuthUserInfo(newUserData)
        .pipe(
          finalize(() => {
            this.isEditing.set(false);
            this.modalService.closeDialog();
            this.reactiveForm.enable();
          }),
        )
        .subscribe({
          next: () => {
            this.toastService.show('Profilo modificato con successo', 'success');
          },
          error: (err) => {
            this.toastService.show(err.message, 'error');
          },
        });
    }
  }
}
