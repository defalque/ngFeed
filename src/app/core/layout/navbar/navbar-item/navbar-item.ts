import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { NgTemplateOutlet } from '../../../../../../node_modules/@angular/common/types/_common_module-chunk';

@Component({
  selector: 'li[appNavbarItem]',
  imports: [RouterLink, LucideAngularModule, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './navbar-item.html',
  styleUrl: './navbar-item.css',
  host: {
    class: 'py-1 flex-1 md:flex-none',
  },
})
export class NavbarItem {
  link = input.required<string>();
  isActive = input<boolean | undefined>(undefined);
  ariaLabel = input.required<string>();
  icon = input.required<LucideIconData>();
}
