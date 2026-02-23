import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('respects disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('applies correct type from variant input', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('respects aria-label input', () => {
    fixture.componentRef.setInput('ariaLabel', 'Test aria-label');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Test aria-label');
  });

  it('applies twStyles input', () => {
    fixture.componentRef.setInput('twStyles', 'bg-red-500');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('class')).toContain('bg-red-500');
  });

  /*
   * Testing outputs - two approaches:
   *
   * 1. spyOn (current): Intercepts the emit() call. Verifies the method was invoked without
   *    needing a real subscriber. Shorter, direct "was it called?" assertion.
   *
   * 2. subscribe (old): Adds a real listener to the output. Verifies the event flows through
   *    the Observable/OutputEmitterRef chain. Tests from a consumer's perspective.
   */
  it('emits when clicked', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.onClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(emitSpy).toHaveBeenCalled();

    // Old approach (subscribe): Simulates a real listener and asserts it received the event.
    // let emitted = false;
    // component.onClick.subscribe(() => { emitted = true; });
    // button?.click();
    // expect(emitted).toBe(true);
  });

  it('does not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.onClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(emitSpy).not.toHaveBeenCalled();

    // Old approach (subscribe): Same pattern; listener would not run because disabled buttons
    // don't fire click events, so emitted stays false.
    // let emitted = false;
    // component.onClick.subscribe(() => { emitted = true; });
    // button?.click();
    // expect(emitted).toBe(false);
  });
});
