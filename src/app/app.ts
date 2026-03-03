import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
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
import { ToastService } from './core/services/toast.service';
import { ThemeService } from './core/services/theme.service';
import { Loader } from './shared/components/loader/loader';

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
    RouterLink,
    Loader,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.userService.loadedCurrentUser;
  resolvedTheme = this.themeService.resolvedTheme;
  toasts = computed(() => this.toastService.toasts());

  isFetching = signal(false);
  /** Set when critical fetch fails; triggers error page display */
  errorState = signal<boolean>(false);

  /** State del dialog della modale */
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
    this.themeService.initTheme();

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile.set(mediaQuery.matches);

    const mediaHandler = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    mediaQuery.addEventListener('change', mediaHandler);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', mediaHandler));

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
    const authUser = this.authService.authenticatedUser();
    this.errorState.set(false);
    this.isFetching.set(true);

    forkJoin({
      posts: this.postService.fetchAllPosts(), // No catchError: mostro l'errore nella pagina di errore
      userInfo: this.userService.fetchAuthUserInfo().pipe(catchError(() => of(null))),
      currentUserPosts: this.postService
        .fetchPostsByUser(authUser?.localId || '', true)
        .pipe(catchError(() => of([]))),
      followedIds: this.userService.fetchFollowedIds().pipe(catchError(() => of([]))),
      savedPostsIds: this.postService.fetchSavedPostsIds().pipe(catchError(() => of([]))),
      likedPostsIds: this.postService.fetchLikedPostsIds().pipe(catchError(() => of([]))),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        next: ({
          posts,
          userInfo,
          currentUserPosts,
          followedIds,
          savedPostsIds,
          likedPostsIds,
        }) => {
          if (authUser && !userInfo) {
            this.toastService.show(
              'Ti invitiamo a completare il tuo profilo per iniziare a utilizzare ngFeed al meglio',
              'warning',
            );
          }
        },
        error: (err) => {
          this.toastService.show(
            'Errore durante il caricamento dei dati. Riprova più tardi.',
            'error',
          );
          this.errorState.set(true);
        },
      });
  }

  /** Riprova il fetch dei dati iniziali (usato dalla pagina di errore) */
  retryInitialData = () => this.fetchInitialData();

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
