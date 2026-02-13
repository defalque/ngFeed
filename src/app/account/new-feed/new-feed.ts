import { afterNextRender, Component, computed, inject, input, viewChild } from '@angular/core';
import { FocusField } from '@/diretcives/focus-field.directive';
import { ModalService } from '@/shared/modal/modal.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '@/post.service';

@Component({
  selector: 'app-new-feed',
  imports: [FocusField, FormsModule],
  templateUrl: './new-feed.html',
  styleUrl: './new-feed.css',
})
export class NewFeed {
  private modalService = inject(ModalService);
  private postService = inject(PostService);

  post = computed(() => {
    const { mode, postId } = this.modalService.isCreateNewPostFormOpen();

    if (mode === 'update') {
      return (
        this.postService.loadedCurrentUserPosts().find((p) => p.id === postId) || {
          title: '',
          description: '',
          content: '',
        }
      );
    }

    return { title: '', description: '', content: '' };
  });

  mode = computed(() => this.modalService.isCreateNewPostFormOpen().mode);

  onSubmit(formData: NgForm) {
    console.log(formData.form);
    if (formData.form.invalid) return;

    formData.form.reset();
  }
}
