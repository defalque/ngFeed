import { ClickOutside } from '@/click-outside.directive';
import { ModalService } from '@/shared/modal/modal.service';
import { UserService } from '@/user.service';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  HouseIcon,
  SearchIcon,
  HeartIcon,
  UserIcon,
  EqualIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, ClickOutside],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
  readonly PlusIcon = PlusIcon;

  private userService = inject(UserService);
  currentUser = this.userService.loadedCurrentUser;

  private modal = inject(ModalService);
  openCreateNewPostForm = this.modal.openCreateNewPost;

  isOpen = signal(false);

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  isHomeActive(): boolean {
    const url = this.router.url;
    return url === '/per-te' || url === '/seguiti';
  }

  // elementRef = inject(ElementRef);

  // @HostListener('document:keydown.escape')
  // onEsc() {
  //   if (this.isOpen()) {
  //     this.isOpen.set(false);
  //   }
  // }

  // @HostListener('document:click', ['$event.target'])
  // onClickOutside(target: EventTarget | null) {
  //   if (
  //     target instanceof HTMLElement &&
  //     this.isOpen() &&
  //     !this.elementRef.nativeElement.contains(target)
  //   ) {
  //     this.isOpen.set(false);
  //   }
  // }
}
