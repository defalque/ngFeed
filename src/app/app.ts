import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, HouseIcon, UserIcon, SearchIcon, HeartIcon } from 'lucide-angular';
import { Navbar } from './ui/navbar/navbar';
import { Header } from './ui/header/header';
import { UserService } from './user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Modal } from './shared/modal/modal';
import { ModalService } from './shared/modal/modal.service';
import { ClickOutside } from './click-outside.directive';
import { Update } from './account/update/update';
import { NewFeed } from './account/new-feed/new-feed';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LucideAngularModule, Navbar, Header, Modal, Update, NewFeed],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;

  private userService = inject(UserService);
  isFetching = signal(false);
  private destroyRef = inject(DestroyRef);

  private modal = inject(ModalService);
  isUpdateProfileFormOpen = this.modal.isUpdateProfileOpen;
  toggleUpdateProfileForm = this.modal.closeUpdateProfile;
  isCreateNewPostFormOpen = this.modal.isCreateNewPostFormOpen;
  toggleCreateNewPostForm = this.modal.closeCreateNewPost;

  ngOnInit(): void {
    this.isFetching.set(true);
    this.userService
      .fetchCurrentUser()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (err) => console.error('Errore nel caricamento utente', err),
      });
  }
}
