import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, HouseIcon, UserIcon, SearchIcon, HeartIcon } from 'lucide-angular';
import { Navbar } from './ui/navbar/navbar';
import { Header } from './ui/header/header';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LucideAngularModule, Navbar, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ngFeed');
  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;

  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.fetchCurrentUser().subscribe({
      error: (err) => console.error('Errore nel caricamento utente', err),
    });
  }
}
