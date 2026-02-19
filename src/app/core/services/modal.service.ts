import { effect, Injectable, signal } from '@angular/core';

type DialogMode = 'create' | 'edit' | 'delete' | 'edit-user' | '';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor() {
    effect(() => {
      const open = this.dialogState().active;
      const html = document.documentElement;
      const hadVerticalScrollbar = window.innerWidth > html.clientWidth;

      html.classList.toggle('modal-open', open);
      html.classList.toggle('modal-open-preserve-scrollbar', open && hadVerticalScrollbar);
      document.body.classList.toggle('modal-open', open);
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

  // settare sempre a true mentre si esegue l'operazione specifica della modal
  isBusy = signal<boolean>(false);

  openDialog = (mode: DialogMode, id: string | null) => {
    if (this.isBusy()) return;

    this.dialogState.set({ active: true, mode, id });
  };

  closeDialog = () => {
    if (this.isBusy()) return;

    this.dialogState.set({ active: false, mode: '', id: null });
  };

  toggleDialog = () => {
    if (this.isBusy()) return;

    this.dialogState.update((v) => ({
      ...v,
      active: !v.active,
    }));
  };
}
