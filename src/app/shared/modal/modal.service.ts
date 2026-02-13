import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor() {
    effect(() => {
      if (this.isCreateNewPostFormOpen().active || this.isUpdateProfileOpen()) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    });
  }

  isDeletePostDialogOpen = signal<{ active: boolean; postId: string | null }>({
    active: false,
    postId: '',
  });
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

  openDeletePostDialog = (postId: string | null) => {
    console.log(postId);
    this.isDeletePostDialogOpen.set({ active: true, postId });
  };

  closeDeletePostDialog = () => {
    this.isDeletePostDialogOpen.set({ active: false, postId: null });
  };

  togglDeletePostDialog = () => {
    this.isDeletePostDialogOpen.update((v) => ({
      ...v,
      active: !v.active,
    }));
  };

  openUpdateProfile = () => {
    this.isUpdateProfileOpen.set(true);
  };

  closeUpdateProfile = () => {
    this.isUpdateProfileOpen.set(false);
  };

  toggleUpdateProfile = () => {
    this.isUpdateProfileOpen.update((v) => !v);
  };

  openCreateNewPost = (mode: 'create' | 'update', postId: string | null) => {
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
