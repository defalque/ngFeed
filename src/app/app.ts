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
import { finalize, forkJoin } from 'rxjs';
import { Modal } from './shared/components/modal/modal';
import { ModalService } from './core/services/modal.service';
import { DeletePost } from './features/user/delete-post/delete-post';
import { UserService } from './core/services/user.service';
import { PostForm } from './features/posts/post-form/post-form';
import { EditUser } from './features/user/edit-user/edit-user';
import { AuthService } from './core/services/auth.service';
import { PostService } from './core/services/post.service';

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

      if (authUser) {
        // Fetch dei dati solo se l'utente è loggato
        this.fetchInitialData();
      } else {
        this.postService.setAuthUserPosts([]);
        this.postService.setUserPost(null);
        this.userService.setUser(null);
      }
    });
  }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.fetchInitialData();
  }

  /** Metodo centralizzato per il fetch dei dati iniziali */
  private fetchInitialData() {
    this.isFetching.set(true);

    forkJoin({
      posts: this.postService.fetchAllPosts(),
      userInfo: this.userService.fetchAuthUserInfo(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (err) => console.error('Errore durante il caricamento dei dati', err),
      });
  }

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
