import { UserService } from '@/core/services/user.service';
import { ModalService } from '@/core/services/modal.service';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, ClickOutside, NavbarItem, DropdownMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  isOpen = signal(false);

  currentUser = this.userService.loadedCurrentUser;
  isAuthenticated = this.authService.isAuthenticated;

  openDialog = this.modalService.openDialog;

  openCreatePostDialog() {
    if (this.isAuthenticated()) {
      this.openDialog('create', null);
      return;
    }

    this.router.navigate(['/auth']);
  }

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
