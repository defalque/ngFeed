import { effect, Injectable, signal } from '@angular/core';

type DialogMode = 'create' | 'edit' | 'delete' | 'edit-user' | '';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor() {
    effect(() => {
      if (this.dialogState().active) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    });
  }

  dialogState = signal<{
    active: boolean;
    mode: DialogMode;
    id: string | null;
  }>({
    active: false,
    mode: '',
    id: null,
  });

  openDialog = (mode: DialogMode, id: string | null) => {
    this.dialogState.set({ active: true, mode, id });
  };

  closeDialog = () => {
    this.dialogState.set({ active: false, mode: '', id: null });
  };

  toggleDialog = () => {
    this.dialogState.update((v) => ({
      ...v,
      active: !v.active,
    }));
  };
}
