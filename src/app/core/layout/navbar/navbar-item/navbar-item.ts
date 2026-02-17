import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'li[appNavbarItem]',
  imports: [RouterLink, LucideAngularModule, RouterLinkActive],
  templateUrl: './navbar-item.html',
  styleUrl: './navbar-item.css',
  host: {
    class: 'py-1 flex-1 md:flex-none',
  },
})
export class NavbarItem {
  link = input.required<string>();
  isActive = input<boolean>();
  ariaLabel = input.required<string>();
  icon = input.required<LucideIconData>();
}
