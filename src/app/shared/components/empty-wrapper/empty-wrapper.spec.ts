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

  it('should have the correct layout class', () => {
    fixture.componentRef.setInput('layout', 'full-page');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('my-20')).toBe(true);
  });
});
