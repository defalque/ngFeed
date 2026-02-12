import { Component } from '@angular/core';
import { FocusField } from '@/diretcives/focus-field.directive';

@Component({
  selector: 'app-update',
  imports: [FocusField],
  templateUrl: './update.html',
  styleUrl: './update.css',
})
export class Update {}
