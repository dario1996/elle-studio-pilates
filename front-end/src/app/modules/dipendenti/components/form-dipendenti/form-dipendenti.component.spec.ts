import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDipendentiComponent } from './form-dipendenti.component';

describe('FormDipendentiComponent', () => {
  let component: FormDipendentiComponent;
  let fixture: ComponentFixture<FormDipendentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDipendentiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDipendentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
