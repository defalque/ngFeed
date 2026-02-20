import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  Type,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, HouseIcon, UserIcon, SearchIcon, HeartIcon } from 'lucide-angular';
import { Navbar } from './core/layout/navbar/navbar';
import { Header } from './core/layout/header/header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Modal } from './shared/components/modal/modal';
import { ModalService } from './core/services/modal.service';
import { DeletePost } from './features/user/delete-post/delete-post';
import { UserService } from './core/services/user.service';
import { PostForm } from './features/posts/post-form/post-form';
import { EditUser } from './features/user/edit-user/edit-user';
import { AuthService } from './core/services/auth.service';
import { PostService } from './core/services/post.service';
import { NgOptimizedImage } from '@angular/common';
import { Error } from './core/pages/error/error';
import { ToastContainer } from './shared/components/toast/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LucideAngularModule,
    Navbar,
    Header,
    Modal,
    PostForm,
    DeletePost,
    EditUser,
    NgOptimizedImage,
    Error,
    ToastContainer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  isFetching = signal(false);
  /** Set when critical fetch fails; triggers error page display */
  errorState = signal<boolean>(false);

  dialogState = this.modalService.dialogState;
  toggleDialog = this.modalService.toggleDialog;

  isOpen = computed(() => {
    const { active, mode } = this.dialogState();
    return active && ['create', 'edit', 'edit-user', 'delete'].includes(mode);
  });

  isAlert = computed(() => this.dialogState().mode === 'delete');

  currentTitle = computed(() => {
    const titles: Record<string, string> = {
      create: 'Nuovo post',
      edit: 'Modifica post',
      'edit-user': 'Modifica Profilo',
      delete: 'Elimina post',
    };
    return titles[this.dialogState().mode] || '';
  });

  isMobile = signal(false);

  constructor() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => this.isMobile.set(e.matches));

    effect(() => {
      const authUser = this.authService.authenticatedUser();

      // I post iniziali devono essere sempre caricati, anche senza utente autenticato.
      this.fetchInitialData();

      if (!authUser) {
        this.postService.setAuthUserPosts([]);
        this.postService.setUserPost(null);
        this.userService.setUser(null);
      }
    });
  }

  ngOnInit(): void {
    this.authService.autoLogin();
  }

  /** Metodo centralizzato per il fetch dei dati iniziali */
  fetchInitialData() {
    this.errorState.set(false);
    this.isFetching.set(true);

    forkJoin({
      posts: this.postService.fetchAllPosts(), // No catchError: failures show error page
      userInfo: this.userService.fetchAuthUserInfo().pipe(catchError(() => of(null))),
      followedIds: this.userService.fetchFollowedIds().pipe(catchError(() => of([]))),
      savedPostsIds: this.postService.fetchSavedPostsIds().pipe(catchError(() => of([]))),
      likedPostsIds: this.postService.fetchLikedPostsIds().pipe(catchError(() => of([]))),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        next: ({ posts, userInfo, followedIds, savedPostsIds, likedPostsIds }) => {
          console.log(posts, userInfo, followedIds, savedPostsIds, likedPostsIds);
          if (posts.length === 0) {
            // Optional: treat empty posts as error (e.g. API unreachable)
            // this.errorState.set(true);
          }
        },
        error: (err) => {
          console.error('Errore durante il caricamento dei dati', err);
          this.errorState.set(true);
        },
      });
  }

  /** Retry initial data fetch (used by error page) */
  retryInitialData = () => this.fetchInitialData();

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
