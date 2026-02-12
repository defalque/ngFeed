import { Component } from '@angular/core';

@Component({
  selector: 'div[accountSkeleton]',
  imports: [],
  templateUrl: './account-skeleton.html',
  styleUrl: './account-skeleton.css',
  host: {
    class: 'w-full',
  },
})
export class AccountSkeleton {}
