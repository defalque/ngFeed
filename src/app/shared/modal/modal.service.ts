import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  isUpdateProfileOpen = signal(false);
  isCreateNewPostFormOpen = signal<{
    active: boolean;
    mode: 'create' | 'update' | '';
    postId: string | null;
  }>({
    active: false,
    mode: 'create',
    postId: null,
  });

  openUpdateProfile = () => {
    this.isUpdateProfileOpen.set(true);
  };

  closeUpdateProfile = () => {
    this.isUpdateProfileOpen.set(false);
  };

  toggleUpdateProfile = () => {
    this.isUpdateProfileOpen.update((v) => !v);
  };

  openCreateNewPost = (mode: 'create' | 'update', postId: string) => {
    this.isCreateNewPostFormOpen.set({ active: true, mode, postId });
  };

  closeCreateNewPost = () => {
    this.isCreateNewPostFormOpen.set({ active: false, mode: '', postId: null });
  };

  toggleCreateNewPost = () => {
    this.isCreateNewPostFormOpen.update((v) => ({
      ...v,
      active: !v.active,
    }));
  };
}
