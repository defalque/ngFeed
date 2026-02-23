import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display 404 heading', () => {
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent?.trim()).toBe('404 Not Found');
  });

  it('should display explanatory message', () => {
    fixture.detectChanges();
    const paragraph = fixture.nativeElement.querySelector('p');
    expect(paragraph?.textContent).toContain('Il link non funziona o la pagina non esiste più');
  });

  it('should have a link to home with routerLink="/"', () => {
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/"]');
    expect(link).toBeTruthy();
  });

  it('should show "Indietro" as the link text', () => {
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Indietro');
  });
});
