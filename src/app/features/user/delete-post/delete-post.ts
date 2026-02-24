import { ModalService } from '@/core/services/modal.service';
import { PostService } from '@/core/services/post.service';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastService } from '@/core/services/toast.service';
import { Loader } from '@/shared/components/loader/loader';

@Component({
  selector: 'app-delete-post',
  imports: [Loader],
  templateUrl: './delete-post.html',
  styleUrl: './delete-post.css',
})
export class DeletePost {
  private postService = inject(PostService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
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
    if (this.isDeleting()) return;

    this.modalService.isBusy.set(true);
    this.isDeleting.set(true);
    this.postService
      .deletePost(this.modalService.dialogState().id!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isDeleting.set(false);
          this.modalService.isBusy.set(false);
          this.modalService.closeDialog();
        }),
      )
      .subscribe({
        error: (err) => {
          this.toastService.show("Errore durante l'eliminazione del post", 'error');
        },
        next: () => {
          this.toastService.show('Post eliminato con successo', 'success');
        },
      });
  }
}
