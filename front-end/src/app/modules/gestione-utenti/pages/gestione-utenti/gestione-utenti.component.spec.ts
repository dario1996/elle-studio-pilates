import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneUtentiComponent } from './gestione-utenti.component';

describe('GestioneUtentiComponent', () => {
  let component: GestioneUtentiComponent;
  let fixture: ComponentFixture<GestioneUtentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneUtentiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneUtentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
