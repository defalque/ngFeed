import { Component } from '@angular/core';
import { FocusField } from '@/diretcives/focus-field.directive';

@Component({
  selector: 'app-new-feed',
  imports: [FocusField],
  templateUrl: './new-feed.html',
  styleUrl: './new-feed.css',
})
export class NewFeed {}
