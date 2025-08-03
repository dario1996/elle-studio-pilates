import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltriGenericiComponent } from './filtri-generici.component';

describe('FiltriGenericiComponent', () => {
  let component: FiltriGenericiComponent;
  let fixture: ComponentFixture<FiltriGenericiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltriGenericiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltriGenericiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
