import { UserService } from '@/core/services/user.service';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import { Loader } from '@/shared/components/loader/loader';
import {
  DEFAULT_AVATAR_PATH,
  safeAvatarUrl,
  safeAvatarUrlValidator,
} from '@/core/utils/safe-avatar-url';

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

function requiredRadioSelection(control: AbstractControl) {
  const value = control.value;
  return value === null || value === undefined ? { required: true } : null;
}

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, A11yModule, FocusField, NgOptimizedImage, Button, Loader],
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

  submitBtn = viewChild<ElementRef<HTMLButtonElement>>('submitBtn');

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
        validators: [Validators.required, equalValues('firstName', 'lastName')],
      },
    ),
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
      asyncValidators: [isUsernameUnique(this.userService, this.currentUser()?.username)],
      updateOn: 'blur',
    }),
    avatar: new FormControl('', {
      validators: [safeAvatarUrlValidator()],
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
    isVerified: new FormControl<boolean | null>(false, {
      validators: [requiredRadioSelection],
    }),
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
        isVerified: this.currentUser()?.isVerified ?? false,
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
    const info = this.reactiveForm.controls.info;
    return (
      info.touched &&
      info.invalid &&
      !!info.errors?.['valuesAreEquals']
    );
  }

  get firstNameIsInvalid() {
    const ctrl = this.reactiveForm.controls.info.controls.firstName;
    return ctrl.touched && ctrl.invalid;
  }

  get lastNameIsInvalid() {
    const ctrl = this.reactiveForm.controls.info.controls.lastName;
    return ctrl.touched && ctrl.invalid;
  }

  get usernameIsInvalid() {
    const ctrl = this.reactiveForm.controls.username;
    return ctrl.touched && ctrl.invalid;
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
    const ctrl = this.reactiveForm.controls.avatar;
    return ctrl.touched && ctrl.invalid;
  }

  get avatarUrl(): string {
    const value = this.reactiveForm.controls.avatar.value;
    // Mostra l'avatar inserito solo se il campo è valido e non vuoto; sempre sanitizzato
    return value && !this.avatarIsInvalid ? safeAvatarUrl(value) : DEFAULT_AVATAR_PATH;
  }

  get bioIsInvalid() {
    const ctrl = this.reactiveForm.controls.bio;
    return ctrl.touched && ctrl.invalid;
  }

  get websiteUrlIsInvalid() {
    const ctrl = this.reactiveForm.controls.websiteUrl;
    return ctrl.touched && ctrl.invalid;
  }

  get locationIsInvalid() {
    const ctrl = this.reactiveForm.controls.location;
    return ctrl.touched && ctrl.invalid;
  }

  get isVerifiedIsInvalid() {
    return (
      this.reactiveForm.controls.isVerified.touched &&
      this.reactiveForm.controls.isVerified.hasError('required')
    );
  }

  get firstNameError(): string | null {
    const ctrl = this.reactiveForm.controls.info.controls.firstName;
    if (!ctrl.errors || !this.firstNameIsInvalid) return null;
    if (ctrl.hasError('required')) return 'Il nome è obbligatorio';
    if (ctrl.hasError('minlength')) return 'Il nome deve contenere almeno 2 caratteri';
    return 'Nome non valido';
  }

  get lastNameError(): string | null {
    const ctrl = this.reactiveForm.controls.info.controls.lastName;
    if (!ctrl.errors || !this.lastNameIsInvalid) return null;
    if (ctrl.hasError('required')) return 'Il cognome è obbligatorio';
    if (ctrl.hasError('minlength')) return 'Il cognome deve contenere almeno 2 caratteri';
    return 'Cognome non valido';
  }

  get usernameError(): string | null {
    const ctrl = this.reactiveForm.controls.username;
    if (!ctrl.errors || !this.usernameIsInvalid) return null;
    if (ctrl.hasError('required')) return "L'username è obbligatorio";
    if (ctrl.hasError('minlength')) return "L'username deve contenere almeno 2 caratteri";
    if (ctrl.hasError('notUnique')) return "L'username è già in uso";
    return 'Username non valido';
  }

  get avatarError(): string | null {
    const ctrl = this.reactiveForm.controls.avatar;
    if (!ctrl.errors || !this.avatarIsInvalid) return null;
    if (ctrl.hasError('unsafeAvatarUrl')) return 'URL non consentita. Usa solo HTTPS o un percorso che inizia con /';
    return 'URL avatar non valida';
  }

  get bioError(): string | null {
    const ctrl = this.reactiveForm.controls.bio;
    if (!ctrl.errors || !this.bioIsInvalid) return null;
    if (ctrl.hasError('minlength')) return 'La bio deve contenere almeno 2 caratteri';
    return 'Bio non valida';
  }

  get websiteUrlError(): string | null {
    const ctrl = this.reactiveForm.controls.websiteUrl;
    if (!ctrl.errors || !this.websiteUrlIsInvalid) return null;
    if (ctrl.hasError('invalidUrl')) return 'Inserisci un URL valido';
    if (ctrl.hasError('invalidProtocol')) return 'L\'URL deve usare HTTPS';
    return 'URL non valida';
  }

  get locationError(): string | null {
    const ctrl = this.reactiveForm.controls.location;
    if (!ctrl.errors || !this.locationIsInvalid) return null;
    if (ctrl.hasError('minlength')) return 'Il luogo deve contenere almeno 2 caratteri';
    return 'Luogo non valido';
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
    'isVerified',
  ] as const;

  private focusFirstInvalidField(): void {
    const { info, username, avatar, bio, websiteUrl, location, isVerified } =
      this.reactiveForm.controls;

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
        case 'isVerified':
          return isVerified.invalid;
        default:
          return false;
      }
    };

    for (const id of this.invalidFieldIds) {
      if (invalidById(id)) {
        const focusTargetId = id === 'isVerified' ? 'v-true' : id;
        document.getElementById(focusTargetId)?.focus();
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
        avatar: user?.avatar,
        bio: user?.bio,
        websiteUrl: user?.websiteUrl,
        location: user?.location,
        isVerified: user?.isVerified ?? false,
      });
    } else {
      this.reactiveForm.reset({
        isVerified: false,
      });
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
      btn.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    const rawAvatar = this.reactiveForm.controls.avatar.value?.trim();
    const newUserData: EditedUser = {
      firstName: this.reactiveForm.controls.info.controls.firstName.value!,
      lastName: this.reactiveForm.controls.info.controls.lastName.value!,
      username: this.reactiveForm.controls.username.value!,
      avatar: rawAvatar ? safeAvatarUrl(rawAvatar) : '',
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
