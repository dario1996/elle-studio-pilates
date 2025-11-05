import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPacchettiComponent } from './form-pacchetti.component';

describe('FormPacchettiComponent', () => {
  let component: FormPacchettiComponent;
  let fixture: ComponentFixture<FormPacchettiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPacchettiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPacchettiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
