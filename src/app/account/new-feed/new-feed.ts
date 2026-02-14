import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FocusField } from '@/diretcives/focus-field.directive';
import { ModalService } from '@/shared/modal/modal.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '@/post.service';
import { FirebasePost, Post } from '@/models/post.model';
import { UserService } from '@/user.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-new-feed',
  imports: [FocusField, FormsModule],
  templateUrl: './new-feed.html',
  styleUrl: './new-feed.css',
})
export class NewFeed {
  private modalService = inject(ModalService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  private destroyRef = inject(DestroyRef);

  openDialog = this.modalService.openDialog;

  post = computed(() => {
    const { mode, id } = this.modalService.dialogState();

    if (mode === 'edit') {
      return (
        this.postService.loadedCurrentUserPosts().find((p) => p.id === id) || {
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

  private addPost(post: FirebasePost) {
    return this.postService.createPost(post).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isWorking.set(false)),
    );
  }

  private editPost(editedPost: FirebasePost) {
    return this.postService.updatePost(this.modalService.dialogState().id!, editedPost).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isWorking.set(false)),
    );
  }

  isWorking = signal(false);

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) return;

    const newPost: FirebasePost = {
      created_at: new Date().toISOString(), // aggiungere anche update_at e non modificare questo se è update mode
      title: formData.form.value.title,
      description: formData.form.value.description,
      content: formData.form.value.content,
      likesCount: this.mode() === 'create' ? 0 : this.post().likesCount!,
      commentsCount: this.mode() === 'create' ? 0 : this.post().commentsCount!,
      userId: this.userService.loadedCurrentUser()!.id,
      userUsername: this.userService.loadedCurrentUser()!.username,
      userFirstName: this.userService.loadedCurrentUser()!.firstName,
      userLastName: this.userService.loadedCurrentUser()!.lastName,
      userIsVerified: this.userService.loadedCurrentUser()!.isVerified,
      userAvatar: this.userService.loadedCurrentUser()!.avatar,
    };

    this.isWorking.set(true);
    if (this.mode() === 'create')
      this.addPost(newPost).subscribe({
        next: () => {
          formData.form.reset();
          this.modalService.closeDialog();
        },
        error: (err) => {
          console.error('Errore durante la creazione del post', err);
        },
      });
    else
      this.editPost(newPost).subscribe({
        next: () => {
          formData.form.reset();
          this.modalService.closeDialog();
        },
        error: (err) => {
          console.error('Errore durante la modifica del post', err);
        },
      });
  }
}
