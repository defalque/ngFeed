import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, HouseIcon, UserIcon, SearchIcon, HeartIcon } from 'lucide-angular';
import { Navbar } from './ui/navbar/navbar';
import { Header } from './ui/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LucideAngularModule, Navbar, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ngFeed');
  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly HeartIcon = HeartIcon;
  readonly UserIcon = UserIcon;
}
