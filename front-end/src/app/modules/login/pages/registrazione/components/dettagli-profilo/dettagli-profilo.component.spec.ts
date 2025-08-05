import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettagliProfiloComponent } from './dettagli-profilo.component';

describe('DettagliProfiloComponent', () => {
  let component: DettagliProfiloComponent;
  let fixture: ComponentFixture<DettagliProfiloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DettagliProfiloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DettagliProfiloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
