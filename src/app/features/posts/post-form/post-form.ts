import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FocusField } from '@/shared/directives/focus-field.directive';
import { ModalService } from '@/core/services/modal.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  EditedPost,
  editPostFormSchema,
  FirebasePost,
  NewPost,
  newPostFormSchema,
  postSchema,
} from '@/core/types/post.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '@/core/services/post.service';
import { UserService } from '@/core/services/user.service';
import z from 'zod';
import { AuthService } from '@/core/services/auth.service';

type NewPostFormErrors = ReturnType<typeof z.treeifyError<typeof newPostFormSchema>>;

@Component({
  selector: 'app-post-form',
  imports: [FocusField, FormsModule, ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
})
export class PostForm {
  private modalService = inject(ModalService);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

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
    console.log(this.authService.authenticatedUser());
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

    const currentValue = this.reactiveForm.getRawValue();
    return JSON.stringify(currentValue) === JSON.stringify(this.initialFormValue);
  }

  get titleIsInvalid() {
    return (
      this.reactiveForm.controls.title.touched &&
      this.reactiveForm.controls.title.dirty &&
      this.reactiveForm.controls.title.invalid
    );
  }

  get descriptionIsInvalid() {
    return (
      this.reactiveForm.controls.description.touched &&
      this.reactiveForm.controls.description.dirty &&
      this.reactiveForm.controls.description.invalid
    );
  }

  get contentIsInvalid() {
    return (
      this.reactiveForm.controls.content.touched &&
      this.reactiveForm.controls.content.dirty &&
      this.reactiveForm.controls.content.invalid
    );
  }

  // formErrors: NewPostFormErrors = { errors: [], properties: {} };

  onSubmit() {
    // if (formData.form.invalid) return;
    // this.formErrors = { errors: [], properties: {} };

    if (this.reactiveForm.invalid || this.isWorking() || this.isUnchanged()) return;

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
        userAvatar: this.userService.loadedCurrentUser()!.avatar,
      };
      this.reactiveForm.disable();

      this.modalService.isBusy.set(true);
      this.isWorking.set(true);
      this.addPost(newPost).subscribe({
        next: () => {
          this.reactiveForm.reset();
        },
        error: (err) => {
          console.error('Errore durante la creazione del post', err);
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
        },
        error: (err) => {
          console.error('Errore durante la modifica del post', err);
        },
      });
    }
  }

  private addPost(post: NewPost) {
    return this.postService.createPost(post).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isWorking.set(false);
        this.modalService.isBusy.set(false);
        this.modalService.closeDialog();
      }),
    );
  }

  private editPost(editedPost: EditedPost) {
    return this.postService.editPost(this.modalService.dialogState().id!, editedPost).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isWorking.set(false);
        this.modalService.isBusy.set(false);
        this.modalService.closeDialog();
      }),
    );
  }
}
