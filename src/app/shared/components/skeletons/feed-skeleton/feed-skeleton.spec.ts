import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedSkeleton } from './feed-skeleton';

describe('FeedSkeleton', () => {
  let component: FeedSkeleton;
  let fixture: ComponentFixture<FeedSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedSkeleton);
    component = fixture.componentInstance;
    // No inputs to set - component has no inputs; detectChanges runs change detection
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply host skeleton layout classes', () => {
    const host = fixture.nativeElement;
    const hostClass = host.getAttribute('class') ?? '';
    expect(hostClass).toContain('animate-pulse');
    expect(hostClass).toContain('bg-white');
    expect(hostClass).toContain('grid');
  });

  it('should render avatar placeholder', () => {
    const avatar = fixture.nativeElement.querySelector('.w-9.h-9');
    expect(avatar).toBeTruthy();
  });

  it('should render username and verified placeholders', () => {
    const placeholders = fixture.nativeElement.querySelectorAll('.bg-gray-200.rounded');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
  });

  it('should render post actions placeholder row', () => {
    const actionPlaceholders = fixture.nativeElement.querySelectorAll(
      '.flex.items-center.gap-2.col-start-2',
    );
    expect(actionPlaceholders.length).toBeGreaterThanOrEqual(1);
  });
});
