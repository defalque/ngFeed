import { Component } from '@angular/core';
import { FeedPost } from '@/home/feed/feed-post/feed-post';

@Component({
  selector: 'app-your-feeds',
  imports: [FeedPost],
  templateUrl: './your-feeds.html',
  styleUrl: './your-feeds.css',
})
export class YourFeeds {}
