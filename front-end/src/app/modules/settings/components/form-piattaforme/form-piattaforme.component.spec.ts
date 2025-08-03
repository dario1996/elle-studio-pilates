import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPiattaformeComponent } from './form-piattaforme.component';

describe('FormPiattaformeComponent', () => {
  let component: FormPiattaformeComponent;
  let fixture: ComponentFixture<FormPiattaformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPiattaformeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPiattaformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
