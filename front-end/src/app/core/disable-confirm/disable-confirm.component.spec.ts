import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableConfirmComponent } from './disable-confirm.component';

describe('DisableConfirmComponent', () => {
  let component: DisableConfirmComponent;
  let fixture: ComponentFixture<DisableConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisableConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
