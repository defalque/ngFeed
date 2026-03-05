import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule, HouseIcon, UserIcon, SearchIcon, HeartIcon } from 'lucide-angular';
import { Navbar } from './core/layout/navbar/navbar';
import { Header } from './core/layout/header/header';
import { catchError, finalize, forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { Post } from './core/types/post.model';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
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
  /** Impostato quando il fetch critico fallisce; mostra la pagina di errore */
  errorState = signal<boolean>(false);

  /** L'emissione annulla qualsiasi fetch in corso (nuovo fetch o distruzione del componente) */
  private fetchAbort$ = new Subject<void>();

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

    this.destroyRef.onDestroy(() => {
      this.fetchAbort$.next();
      this.fetchAbort$.complete();
    });

    // Eseguito prima dell'effect così il primo run vede lo stato auth corretto (nessun doppio fetch).
    this.authService.autoLogin();

    effect(() => {
      const authUser = this.authService.authenticatedUser();

      if (this.errorState()) {
        // In errore: non fare auto-fetch, attendere che l'utente clicchi Riprova
        if (!authUser) {
          this.postService.setAuthUserPosts([]);
          this.postService.setUserPost(null);
          this.userService.setUser(null);
        }
        return;
      }

      this.fetchInitialData();
      if (!authUser) {
        this.postService.setAuthUserPosts([]);
        this.postService.setUserPost(null);
        this.userService.setUser(null);
      }
    });
  }

  /** Metodo centralizzato per il fetch dei dati iniziali */
  fetchInitialData() {
    this.fetchAbort$.next(); // Annulla qualsiasi fetch in corso prima di avviarne uno nuovo

    const authUser = this.authService.authenticatedUser();
    if (this.errorState()) {
      this.toastService.dismissAll(); // Rimuove il toast di errore residuo prima del retry
    }
    this.errorState.set(false);
    this.isFetching.set(true);

    const authDependent$ = authUser
      ? {
          userInfo: this.userService.fetchAuthUserInfo().pipe(catchError(() => of(null))),
          currentUserPosts: this.postService
            .fetchPostsByUser(authUser.localId, true)
            .pipe(catchError(() => of([]))),
          followedIds: this.userService.fetchFollowedIds().pipe(catchError(() => of([]))),
          savedPostsIds: this.postService.fetchSavedPostsIds().pipe(catchError(() => of([]))),
          likedPostsIds: this.postService.fetchLikedPostsIds().pipe(catchError(() => of([]))),
        }
      : {
          userInfo: of(null),
          currentUserPosts: of([] as Post[]),
          followedIds: of([] as string[]),
          savedPostsIds: of([] as string[]),
          likedPostsIds: of([] as string[]),
        };

    forkJoin({
      posts: this.postService.fetchAllPosts(),
      ...authDependent$,
    })
      .pipe(
        finalize(() => this.isFetching.set(false)),
        takeUntil(this.fetchAbort$), // Ultimo: annulla l'intera chain quando fetchAbort$ emette
      )
      .subscribe({
        next: ({ userInfo }) => {
          if (authUser && !userInfo) {
            this.toastService.show(
              'Ti invitiamo a completare il tuo profilo per iniziare a utilizzare ngFeed al meglio',
              'warning',
            );
          }
        },
        error: () => {
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

  /** Skip link: scrolla e mette focus sul main; il Tab successivo va al primo focusabile dentro */
  skipToMain(event: Event) {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.scrollIntoView({ behavior: 'smooth' });
    (main as HTMLElement)?.focus();
  }

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
