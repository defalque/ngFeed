import { Pipe, PipeTransform } from '@angular/core';
import { formatPostRelativeTime } from '@/core/utils/relative-post-time';

@Pipe({ name: 'relativePostTime', standalone: true })
export class RelativePostTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null || value === '') {
      return '';
    }
    return formatPostRelativeTime(value);
  }
}
