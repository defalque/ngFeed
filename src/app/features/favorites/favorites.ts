import { PostService } from '@/core/services/post.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '../posts/post/post';

@Component({
  selector: 'app-favorites',
  imports: [BlogPost],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class Favorites {
  private postService = inject(PostService);
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = computed(() => this.postService.loadedLikedPostsIds());
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));
  posts = computed(() =>
    this.postService.allLoadedPosts().filter((post) => this.savedPostsIds().includes(post.id)),
  );
}
