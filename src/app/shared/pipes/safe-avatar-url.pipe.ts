import { Pipe, PipeTransform } from '@angular/core';
import { safeAvatarUrl } from '@/core/utils/safe-avatar-url';

/**
 * Use when binding user-provided avatar URLs to img src/ngSrc.
 * Returns the URL only if it is safe (https or path starting with /); otherwise returns the default avatar path.
 */
@Pipe({ name: 'safeAvatarUrl' })
export class SafeAvatarUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return safeAvatarUrl(url);
  }
}
