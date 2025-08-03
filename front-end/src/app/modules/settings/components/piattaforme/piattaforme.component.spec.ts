import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiattaformeComponent } from './piattaforme.component';

describe('PiattaformeComponent', () => {
  let component: PiattaformeComponent;
  let fixture: ComponentFixture<PiattaformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiattaformeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiattaformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
