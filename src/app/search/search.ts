import { Component } from '@angular/core';
import {
  EllipsisIcon,
  LucideAngularModule,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-search',
  imports: [LucideAngularModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full' },
})
export class Search {
  readonly EllipsisIcon = EllipsisIcon;
  readonly SearchIcon = SearchIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;
}
