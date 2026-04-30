import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyWrapper } from './empty-wrapper';

describe('EmptyWrapper', () => {
  let component: EmptyWrapper;
  let fixture: ComponentFixture<EmptyWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyWrapper);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply host layout classes', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList.contains('flex')).toBe(true);
    expect(el.classList.contains('flex-col')).toBe(true);
    expect(el.classList.contains('justify-center')).toBe(true);
    expect(el.classList.contains('items-center')).toBe(true);
    expect(el.classList.contains('py-12')).toBe(true);
  });
});
