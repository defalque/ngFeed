import { ClickOutside } from '@/click-outside.directive';
import { ModalService } from '@/shared/modal/modal.service';
import { UserService } from '@/user.service';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { NavbarItem } from './navbar-item/navbar-item';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, ClickOutside, NavbarItem],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  isOpen = signal(false);

  currentUser = this.userService.loadedCurrentUser;

  openDialog = this.modalService.openDialog;

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

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
  readonly PlusIcon = PlusIcon;
}
