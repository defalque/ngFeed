import { PostService } from '@/core/services/post.service';
import { Component, computed, inject } from '@angular/core';
import { BlogPost } from '../posts/post/post';

@Component({
  selector: 'app-favorites',
  imports: [BlogPost],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  host: { class: 'block w-full' },
})
export class Favorites {
  private postService = inject(PostService);
  savedPostsIds = this.postService.loadedSavedPostsIds;

  posts = computed(() =>
    this.postService.allLoadedPosts().filter((post) => this.savedPostsIds().includes(post.id)),
  );
}
