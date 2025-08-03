import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCorsiComponent } from './form-corsi.component';

describe('FormCorsiComponent', () => {
  let component: FormCorsiComponent;
  let fixture: ComponentFixture<FormCorsiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCorsiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCorsiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
