import { Component } from '@angular/core';

@Component({
  selector: 'div[accountSkeleton]',
  imports: [],
  templateUrl: './account-skeleton.html',
  styleUrl: './account-skeleton.css',
  host: {
    class: 'flex items-cente justify-between gap-4 p-4',
  },
})
export class AccountSkeleton {}
