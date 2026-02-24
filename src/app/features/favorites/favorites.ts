import { PostService } from '@/core/services/post.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '../posts/post/post';
import { EmptyWrapper } from '@/shared/components/empty-wrapper/empty-wrapper';

@Component({
  selector: 'app-favorites',
  imports: [BlogPost, EmptyWrapper],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class Favorites {
  private postService = inject(PostService);

  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = this.postService.loadedLikedPostsIds;
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  posts = computed(() =>
    this.postService.allLoadedPosts().filter((post) => this.savedSet().has(post.id)),
  );
}
