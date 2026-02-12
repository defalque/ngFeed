import { Component, input } from '@angular/core';

@Component({
  selector: 'app-verified-icon',
  imports: [],
  templateUrl: './verified-icon.html',
  styleUrl: './verified-icon.css',
})
export class VerifiedIcon {
  size = input.required<'size-4' | 'size-4.5'>();
}
