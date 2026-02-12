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

  post = {
    ...this.postService
      .loadedCurrentUserPosts()
      .find((post) => post.id === this.modalService.isCreateNewPostFormOpen().postId),
  };

  mode = computed(() => this.modalService.isCreateNewPostFormOpen().mode);

  onSubmit(formData: NgForm) {
    console.log(this.post);
    console.log(formData.form);
    if (formData.form.invalid) return;

    formData.form.reset();
  }
}
