import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FocusField } from '@/shared/directives/focus-field.directive';
import { ModalService } from '@/core/services/modal.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  EditedPost,
  NewPost,
} from '@/core/types/post.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '@/core/services/post.service';
import { UserService } from '@/core/services/user.service';
// import { AuthService } from '@/core/services/auth.service';
import { ToastService } from '@/core/services/toast.service';
import { Button } from '@/shared/components/button/button';
import { Loader } from '@/shared/components/loader/loader';
import { safeAvatarUrl } from '@/core/utils/safe-avatar-url';

@Component({
  selector: 'app-post-form',
  imports: [FocusField, FormsModule, ReactiveFormsModule, Button, Loader],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostForm {
  private modalService = inject(ModalService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  // private authService = inject(AuthService);

  currentUser = this.userService.loadedCurrentUser;
  openDialog = this.modalService.openDialog;

  post = computed(() => {
    const { mode, id } = this.modalService.dialogState();

    if (mode === 'edit') {
      return (
        this.postService.authUserPostsReadonly().find((p) => p.id === id) || {
          title: '',
          description: '',
          content: '',
          likesCount: 0,
          commentsCount: 0,
        }
      );
    }

    return { title: '', description: '', content: '' };
  });

  mode = computed(() => this.modalService.dialogState().mode);

  isWorking = signal(false);

  initialFormValue!: any;

  reactiveForm = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)],
    }),
    content: new FormControl('', {
      validators: [Validators.required, Validators.minLength(20)],
    }),
  });

  ngOnInit(): void {
    if (this.mode() === 'edit') {
      this.reactiveForm.patchValue({
        title: this.post()?.title,
        description: this.post()?.description,
        content: this.post()?.content,
      });

      this.initialFormValue = this.reactiveForm.getRawValue();
      this.reactiveForm.markAsPristine();
    }
  }

  isUnchanged(): boolean {
    if (!this.currentUser()) return false;
    if (this.mode() === 'create') return false;
    if (this.initialFormValue === undefined) return false;

    const currentValue = this.reactiveForm.getRawValue();
    return JSON.stringify(currentValue) === JSON.stringify(this.initialFormValue);
  }

  get titleIsInvalid() {
    const ctrl = this.reactiveForm.controls.title;
    return ctrl.touched && ctrl.invalid;
  }

  get descriptionIsInvalid() {
    const ctrl = this.reactiveForm.controls.description;
    return ctrl.touched && ctrl.invalid;
  }

  get contentIsInvalid() {
    const ctrl = this.reactiveForm.controls.content;
    return ctrl.touched && ctrl.invalid;
  }

  get titleError(): string | null {
    const ctrl = this.reactiveForm.controls.title;
    if (!ctrl.errors || !this.titleIsInvalid) return null;
    if (ctrl.hasError('required')) return 'Il titolo è obbligatorio';
    if (ctrl.hasError('minlength')) return 'Il titolo deve contenere almeno 2 caratteri';
    return 'Titolo non valido';
  }

  get descriptionError(): string | null {
    const ctrl = this.reactiveForm.controls.description;
    if (!ctrl.errors || !this.descriptionIsInvalid) return null;
    if (ctrl.hasError('required')) return 'La descrizione è obbligatoria';
    if (ctrl.hasError('minlength')) return 'La descrizione deve contenere almeno 2 caratteri';
    return 'Descrizione non valida';
  }

  get contentError(): string | null {
    const ctrl = this.reactiveForm.controls.content;
    if (!ctrl.errors || !this.contentIsInvalid) return null;
    if (ctrl.hasError('required')) return 'Il contenuto è obbligatorio';
    if (ctrl.hasError('minlength')) return 'Il contenuto deve contenere almeno 20 caratteri';
    return 'Contenuto non valido';
  }

  private readonly invalidFieldIds = ['title', 'description', 'content'] as const;

  private focusFirstInvalidField(): void {
    const { title, description, content } = this.reactiveForm.controls;

    const invalidById = (id: string) => {
      switch (id) {
        case 'title':
          return title.invalid;
        case 'description':
          return description.invalid;
        case 'content':
          return content.invalid;
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

  onSubmit() {
    if (this.isWorking() || this.isUnchanged()) return;

    if (this.reactiveForm.invalid) {
      this.reactiveForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    if (this.mode() === 'create') {
      const newPost = {
        // created_at: new Date().toISOString(),
        // title: formData.form.value.title,
        // description: formData.form.value.description,
        // content: formData.form.value.content,
        // userId: this.userService.loadedCurrentUser()!.id,
        // userUsername: this.userService.loadedCurrentUser()!.username,
        // userFirstName: this.userService.loadedCurrentUser()!.firstName,
        // userLastName: this.userService.loadedCurrentUser()!.lastName,
        // userIsVerified: this.userService.loadedCurrentUser()!.isVerified,
        // userAvatar: this.userService.loadedCurrentUser()!.avatar,
        created_at: new Date().toISOString(),
        title: this.reactiveForm.controls.title.value!,
        description: this.reactiveForm.controls.description.value!,
        content: this.reactiveForm.controls.content.value!,
        userId: this.userService.loadedCurrentUser()!.id,
        userUsername: this.userService.loadedCurrentUser()!.username,
        userFirstName: this.userService.loadedCurrentUser()!.firstName,
        userLastName: this.userService.loadedCurrentUser()!.lastName,
        userIsVerified: this.userService.loadedCurrentUser()!.isVerified,
        userAvatar: safeAvatarUrl(this.userService.loadedCurrentUser()!.avatar),
      };
      this.reactiveForm.disable();

      this.modalService.isBusy.set(true);
      this.isWorking.set(true);
      this.addPost(newPost).subscribe({
        next: () => {
          this.reactiveForm.reset();
          this.toastService.show('Post creato con successo', 'success');
        },
        error: (err) => {
          this.toastService.show(err.message, 'error');
        },
      });
    } else {
      const editedPost = {
        title: this.reactiveForm.controls.title.value!,
        description: this.reactiveForm.controls.description.value!,
        content: this.reactiveForm.controls.content.value!,
      };

      this.isWorking.set(true);
      this.editPost(editedPost).subscribe({
        next: () => {
          this.reactiveForm.reset();
          this.toastService.show('Post modificato con successo', 'success');
        },
        error: (err) => {
          this.toastService.show(err.message, 'error');
        },
      });
    }
  }

  private addPost(post: NewPost) {
    return this.postService.createPost(post).pipe(
      finalize(() => {
        this.isWorking.set(false);
        this.modalService.isBusy.set(false);
        this.modalService.closeDialog();
      }),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  private editPost(editedPost: EditedPost) {
    return this.postService.editPost(this.modalService.dialogState().id!, editedPost).pipe(
      finalize(() => {
        this.isWorking.set(false);
        this.modalService.isBusy.set(false);
        this.modalService.closeDialog();
      }),
      takeUntilDestroyed(this.destroyRef),
    );
  }
}
