/**
 * Angular unit test imports:
 * - TestBed: Creates a test environment for your component (like a mini Angular app)
 * - ComponentFixture: A handle to the created component and its DOM - lets you access the instance,
 *   trigger change detection, and query the rendered HTML
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedIcon } from './verified-icon';

/**
 * describe('ComponentName', () => { ... })
 * Groups related tests together. The string is the test suite name shown in the report.
 * All it() blocks inside belong to this suite.
 */
describe('VerifiedIcon', () => {
  // Variables shared across all tests (reset before each test by beforeEach)
  let component: VerifiedIcon;
  let fixture: ComponentFixture<VerifiedIcon>;

  /**
   * beforeEach runs before EACH individual test.
   * Use it to set up a clean state so tests don't affect each other.
   */
  beforeEach(async () => {
    // TestBed.configureTestingModule: Declare what this "mini app" needs (like NgModule)
    await TestBed.configureTestingModule({
      imports: [VerifiedIcon], // The component under test (and its template dependencies)
    }).compileComponents(); // Compile templates and styles (async, so we await)

    // Create an instance of our component wrapped in a fixture
    fixture = TestBed.createComponent(VerifiedIcon);
    component = fixture.componentInstance; // Direct reference to the component class
  });

  /**
   * it('should do X', () => { ... }) or test('should do X', () => { ... })
   * Defines a single test case. The string is the test description.
   */
  it('should create', () => {
    // setInput: For components with signal inputs, we must provide required inputs before detectChanges
    fixture.componentRef.setInput('size', 'size-4');
    // detectChanges(): Run Angular's change detection - updates the DOM based on component state
    fixture.detectChanges();
    // expect(actual).toBeTruthy(): Asserts the value is "truthy" (not null, undefined, 0, false, '')
    expect(component).toBeTruthy();
  });

  it('should render SVG element', () => {
    fixture.componentRef.setInput('size', 'size-4');
    fixture.detectChanges();
    // fixture.nativeElement: The root DOM node of the component's template (like document.querySelector)
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    // expect(x).toBe(y): Strict equality - x must equal y exactly
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  /** Helper to get the SVG's class attribute (getAttribute works reliably in test DOM; className can vary) */
  function getSvgClass(): string {
    const svg = fixture.nativeElement.querySelector('svg');
    return svg?.getAttribute('class') ?? ''; // ?? '' = use empty string if null/undefined
  }

  it('should apply size class from size input', () => {
    fixture.componentRef.setInput('size', 'size-5');
    fixture.detectChanges();
    // expect(string).toContain(substring): Passes if the string includes the substring
    expect(getSvgClass()).toContain('size-5');
  });

  it('should apply blue color classes when black is false (default)', () => {
    fixture.componentRef.setInput('size', 'size-4');
    // We don't set 'black' - it defaults to false
    fixture.detectChanges();
    const svgClass = getSvgClass();
    expect(svgClass).toContain('text-blue-500');
    expect(svgClass).toContain('dark:text-sky-500');
  });

  it('should apply black color classes when black is true', () => {
    fixture.componentRef.setInput('size', 'size-4');
    fixture.componentRef.setInput('black', true); // Override the default
    fixture.detectChanges();
    const svgClass = getSvgClass();
    expect(svgClass).toContain('text-black');
    expect(svgClass).toContain('dark:text-white');
  });

  it('should not apply absolute positioning when mode is inline (default)', () => {
    fixture.componentRef.setInput('size', 'size-4');
    fixture.detectChanges();
    const svgClass = getSvgClass();
    // .not negates the matcher: expect(x).not.toContain(y) means x must NOT contain y
    expect(svgClass).not.toContain('absolute');
    expect(svgClass).not.toContain('top-1');
    expect(svgClass).not.toContain('right-2');
  });

  it('should apply absolute positioning when mode is absolute', () => {
    fixture.componentRef.setInput('size', 'size-4');
    fixture.componentRef.setInput('mode', 'absolute');
    fixture.detectChanges();
    const svgClass = getSvgClass();
    expect(svgClass).toContain('absolute');
    expect(svgClass).toContain('top-1');
    expect(svgClass).toContain('right-2');
  });

  it('should support all valid size variants', () => {
    // 'as const' makes the array readonly and the types literal ('size-4' | 'size-4.5' | 'size-5')
    const sizes = ['size-4', 'size-4.5', 'size-5'] as const;

    for (const size of sizes) {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(getSvgClass()).toContain(size);
    }
  });
});
