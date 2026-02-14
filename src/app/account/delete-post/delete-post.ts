import { PostService } from '@/post.service';
import { ModalService } from '@/shared/modal/modal.service';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-delete-post',
  imports: [],
  templateUrl: './delete-post.html',
  styleUrl: './delete-post.css',
})
export class DeletePost {
  private postService = inject(PostService);
  private modalService = inject(ModalService);

  closeModal = this.modalService.closeDialog;

  postTitle = computed(() => {
    const { id } = this.modalService.dialogState();
    return this.postService.loadedCurrentUserPosts().find((post) => post.id === id)?.title || '';
  });
}
