import { Component } from '@angular/core';
import { FeedPost } from '../feed/feed-post/feed-post';

@Component({
  selector: 'app-followed',
  imports: [FeedPost],
  templateUrl: './followed.html',
})
export class Followed {}
