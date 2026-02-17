import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FocusField } from '@/shared/directives/focus-field.directive';
import { ModalService } from '@/core/services/modal.service';
import { FormsModule, NgForm } from '@angular/forms';
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

type NewPostFormErrors = ReturnType<typeof z.treeifyError<typeof newPostFormSchema>>;

@Component({
  selector: 'app-post-form',
  imports: [FocusField, FormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
})
export class PostForm {
  private modalService = inject(ModalService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  private destroyRef = inject(DestroyRef);

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

  formErrors: NewPostFormErrors = { errors: [], properties: {} };

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) return;
    this.formErrors = { errors: [], properties: {} };

    if (this.mode() === 'create') {
      const newPost = {
        created_at: new Date().toISOString(),
        title: formData.form.value.title,
        description: formData.form.value.description,
        content: formData.form.value.content,
        userId: this.userService.loadedCurrentUser()!.id,
        userUsername: this.userService.loadedCurrentUser()!.username,
        userFirstName: this.userService.loadedCurrentUser()!.firstName,
        userLastName: this.userService.loadedCurrentUser()!.lastName,
        userIsVerified: this.userService.loadedCurrentUser()!.isVerified,
        userAvatar: this.userService.loadedCurrentUser()!.avatar,
      };
      // const validationResult = newPostFormSchema.safeParse(newPost);
      // if (!validationResult.success) {
      //   console.log(validationResult.error);
      //   this.formErrors = z.treeifyError(validationResult.error);
      //   console.log(this.formErrors);
      //   return;
      // }

      this.isWorking.set(true);
      this.addPost(newPost).subscribe({
        next: () => {
          formData.form.reset();
          this.modalService.closeDialog();
        },
        error: (err) => {
          console.error('Errore durante la creazione del post', err);
        },
      });
    } else {
      // const editedPost = {
      //   title: formData.form.value.title,
      //   description: formData.form.value.description,
      //   content: formData.form.value.content,
      // };
      // const validationResult = editPostFormSchema.safeParse(editedPost);
      // if (!validationResult.success) {
      //   console.log(validationResult.error);
      //   return;
      // }
      // this.isWorking.set(true);
      // this.editPost(editedPost).subscribe({
      //   next: () => {
      //     formData.form.reset();
      //     this.modalService.closeDialog();
      //   },
      //   error: (err) => {
      //     console.error('Errore durante la modifica del post', err);
      //   },
      // });
    }
  }

  private addPost(post: NewPost) {
    return this.postService.createPost(post).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isWorking.set(false)),
    );
  }

  private editPost(editedPost: EditedPost) {
    // return this.postService.updatePost(this.modalService.dialogState().id!, editedPost).pipe(
    //   takeUntilDestroyed(this.destroyRef),
    //   finalize(() => this.isWorking.set(false)),
    // );
  }
}
