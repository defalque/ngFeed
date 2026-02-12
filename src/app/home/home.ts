import { ModalService } from '@/shared/modal/modal.service';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.html',
  host: { class: 'block w-full' },
})
export class Home {
  private modal = inject(ModalService);
  openCreateNewPostForm = this.modal.openCreateNewPost;
}
