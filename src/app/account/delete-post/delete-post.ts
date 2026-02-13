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

  closeModal = this.modalService.closeDeletePostDialog;

  postTitle = computed(() => {
    const { postId } = this.modalService.isDeletePostDialogOpen();
    console.log(postId);
    return (
      this.postService.loadedCurrentUserPosts().find((post) => post.id === postId)?.title || ''
    );
  });
}
