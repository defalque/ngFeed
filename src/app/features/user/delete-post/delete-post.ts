import { ModalService } from '@/core/services/modal.service';
import { PostService } from '@/core/services/post.service';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-post',
  imports: [],
  templateUrl: './delete-post.html',
  styleUrl: './delete-post.css',
})
export class DeletePost {
  private postService = inject(PostService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  closeModal = this.modalService.closeDialog;

  postTitle = computed(() => {
    const { id } = this.modalService.dialogState();
    return this.postService.authUserPostsReadonly().find((post) => post.id === id)?.title || '';
  });

  isDeleting = signal(false);

  onCloseModal() {
    if (this.isDeleting()) return;

    this.closeModal();
  }

  onDeletePost() {
    // this.isDeleting.set(true);
    // this.postService
    //   .deletePost(this.modalService.dialogState().id!)
    //   .pipe(
    //     takeUntilDestroyed(this.destroyRef),
    //     finalize(() => this.isDeleting.set(true)),
    //   )
    //   .subscribe({
    //     next: () => {
    //       this.modalService.closeDialog();
    //     },
    //     error: (err) => {
    //       console.error("Errore durante l'eliminazione del post", err);
    //     },
    //   });
  }
}
