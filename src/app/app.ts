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
import { Update } from './account/update/update';
import { NewFeed } from './account/new-feed/new-feed';
import { DeletePost } from './account/delete-post/delete-post';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LucideAngularModule, Navbar, Header, Modal, Update, NewFeed, DeletePost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
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
      case 'update':
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
      ['create', 'edit', 'update', 'delete'].includes(this.dialogState().mode)
    );
  }

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

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
