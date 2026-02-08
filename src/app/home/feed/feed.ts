import { Component } from '@angular/core';
import { FeedPost } from './feed-post/feed-post';

@Component({
  selector: 'app-feed',
  imports: [FeedPost],
  templateUrl: './feed.html',
})
export class Feed {}
