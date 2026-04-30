import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hint } from './hint';

describe('Hint', () => {
  let component: Hint;
  let fixture: ComponentFixture<Hint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hint);
    fixture.componentRef.setInput('fieldValue', 'test-value');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
