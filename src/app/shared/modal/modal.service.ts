import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  isUpdateProfileOpen = signal(false);
  isCreateNewPostFormOpen = signal(false);

  openUpdateProfile = () => {
    this.isUpdateProfileOpen.set(true);
  };

  closeUpdateProfile = () => {
    this.isUpdateProfileOpen.set(false);
  };

  toggleUpdateProfile = () => {
    this.isUpdateProfileOpen.update((v) => !v);
  };

  openCreateNewPost = () => {
    this.isCreateNewPostFormOpen.set(true);
  };

  closeCreateNewPost = () => {
    this.isCreateNewPostFormOpen.set(false);
  };

  toggleCreateNewPost = () => {
    this.isCreateNewPostFormOpen.update((v) => !v);
  };
}
