import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatoMedicoComponent } from './certificato-medico.component';

describe('CertificatoMedicoComponent', () => {
  let component: CertificatoMedicoComponent;
  let fixture: ComponentFixture<CertificatoMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatoMedicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatoMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
