import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { UserPostsSkeleton } from '@/shared/components/skeletons/user-posts-skeleton/user-posts-skeleton';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '@/core/services/post.service';
import { UserService } from '@/core/services/user.service';
import { BlogPost } from '@/features/posts/post/post';

@Component({
  selector: 'app-user-posts',
  imports: [BlogPost, UserPostsSkeleton],
  templateUrl: './user-posts.html',
  styleUrl: './user-posts.css',
})
export class UserPosts {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  id = input.required<string>();

  error = signal('');
  isFetching = signal(false);

  loadedGenericUserPosts = this.postService.loadedUserPosts;
  loadedCurrentUserPosts = this.postService.loadedCurrentUserPosts;

  loadedUserPosts = computed(() => {
    return this.isCurrentUserPosts()
      ? this.loadedCurrentUserPosts()
      : this.loadedGenericUserPosts();
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (
        params.get('id') === this.userService.loadedCurrentUser()?.id &&
        this.loadedCurrentUserPosts().length
      ) {
        return;
      }

      this.loadUserPosts(params.get('id')!);
    });
  }

  private loadUserPosts(userId: string) {
    this.isFetching.set(true);
    this.postService
      .fetchUserPosts(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message);
        },
      });
  }

  isCurrentUserPosts() {
    return this.id() === this.userService.loadedCurrentUser()?.id;
  }
}
