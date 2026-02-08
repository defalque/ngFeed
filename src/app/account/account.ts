import { Component, inject, ViewEncapsulation } from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-account',
  imports: [LucideAngularModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './account.html',
  styleUrl: './account.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block w-full' },
})
export class Account {
  readonly EllipsisIcon = EllipsisIcon;
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  private router = inject(Router);

  isUpdateProfileUrlActive(): boolean {
    return this.router.url === '/profilo/modifica';
  }
}
