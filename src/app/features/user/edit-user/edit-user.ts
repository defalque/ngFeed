import { UserService } from '@/core/services/user.service';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { EditedUser } from '@/core/types/user.model';
import { ModalService } from '@/core/services/modal.service';

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
  imports: [ReactiveFormsModule, A11yModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  currentUser = this.userService.loadedCurrentUser;

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
    const user = this.currentUser();
    if (user) {
      this.reactiveForm.patchValue({
        // Mappiamo i dati flat nel gruppo 'info'
        info: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        // Gli altri campi coincidono, quindi passano direttamente
        username: user.username,
        bio: user.bio,
        websiteUrl: user.websiteUrl,
        location: user.location,
        isVerified: user.isVerified,
      });
    }
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

  get usernameIsValid() {
    return (
      this.reactiveForm.controls.username.touched &&
      this.reactiveForm.controls.username.dirty &&
      this.reactiveForm.controls.username.invalid
    );
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

  onReset() {
    if (this.isEditing()) return;

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
    if (this.reactiveForm.invalid || this.isEditing()) return;

    const newUserData: EditedUser = {
      firstName: this.reactiveForm.controls.info.controls.firstName.value!,
      lastName: this.reactiveForm.controls.info.controls.lastName.value!,
      username: this.reactiveForm.controls.username.value!,
      bio: this.reactiveForm.controls.bio.value!,
      websiteUrl: this.reactiveForm.controls.websiteUrl.value!,
      location: this.reactiveForm.controls.location.value!,
      isVerified: this.reactiveForm.controls.isVerified.value!,
    };

    // Disabilita tutto il form mentre carica
    this.reactiveForm.disable();

    // ATTENZIONE - l'update non aggiorna ancora la tabella usernames nel caso l'utente modifichi il suo username, e non aggiorna i riferimenti nei post
    this.isEditing.set(true);
    this.userService
      .updateUser(this.currentUser()!.id, newUserData)
      .pipe(
        finalize(() => {
          this.isEditing.set(false);
          this.modalService.closeDialog();
          // Riabilita il form quando la chiamata è finita
          this.reactiveForm.enable();
        }),
      )
      .subscribe();
  }
}
