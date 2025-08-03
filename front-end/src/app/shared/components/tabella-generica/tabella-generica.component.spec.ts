import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaGenericaComponent } from './tabella-generica.component';

describe('TabellaGenericaComponent', () => {
  let component: TabellaGenericaComponent;
  let fixture: ComponentFixture<TabellaGenericaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabellaGenericaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabellaGenericaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
