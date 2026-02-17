import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
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

  currentTitle() {
    switch (this.dialogState().mode) {
      case 'create':
        return 'Nuovo post';
      case 'edit':
        return 'Modifica post';
      case 'edit-user':
        return 'Modifica Profilo';
      case 'delete':
        return 'Elimina post';
      default:
        return '';
    }
  }

  isAlert() {
    return this.dialogState().mode === 'delete';
  }

  isOpen() {
    return (
      this.dialogState().active &&
      ['create', 'edit', 'edit-user', 'delete'].includes(this.dialogState().mode)
    );
  }

  constructor() {
    effect(() => {
      const authUser = this.authService.authenticatedUser();

      if (authUser) {
        // Quando authUser cambia da null a un oggetto (login avvenuto)
        // facciamo il fetch dei dati mancanti
        forkJoin({
          posts: this.postService.fetchAllPosts(),
          userInfo: this.userService.fetchAuthUserInfo(),
        })
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.isFetching.set(false)),
          )
          .subscribe({
            error: (err) => console.error('Si è verificato un errore durante il caricamento', err),
          });
      } else {
        this.userService.setUser(null);
      }
    });
  }

  ngOnInit(): void {
    this.isFetching.set(true);

    this.authService.autoLogin();

    forkJoin({
      posts: this.postService.fetchAllPosts(),
      userInfo: this.userService.fetchAuthUserInfo(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        next: (data) => {},
        error: (err) => console.error('Si è verificato un errore durante il caricamento', err),
      });
  }

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
