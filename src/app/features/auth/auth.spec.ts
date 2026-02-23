import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Auth } from './auth';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('switches mode', async () => {
    await fixture.whenStable();
    expect(component.isLoginMode()).toBe(true);
    component.switchMode();
    expect(component.isLoginMode()).toBe(false);
  });

  it('shows password text when togglePasswordVisibility is set to true and hides it when set to false', () => {
    component.passwordVisible.set(true);
    fixture.detectChanges();
    const textPasswordInput = fixture.nativeElement.querySelector('input[type="text"]');
    expect(textPasswordInput).toBeTruthy();

    component.passwordVisible.set(false);
    fixture.detectChanges();
    const passwordPasswordInput = fixture.nativeElement.querySelector('input[type="password"]');
    expect(passwordPasswordInput).toBeTruthy();
  });
});
