import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterButtonComponent } from './filter-button.component';

describe('FilterButtonComponent', () => {
  let component: FilterButtonComponent;
  let fixture: ComponentFixture<FilterButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClick event when button is clicked', () => {
    spyOn(component.onClick, 'emit');
    component.onButtonClick();
    expect(component.onClick.emit).toHaveBeenCalled();
  });

  it('should display active filters count', () => {
    component.activeFiltersCount = 3;
    fixture.detectChanges();
    
    const badge = fixture.nativeElement.querySelector('.filter-badge');
    expect(badge.textContent.trim()).toBe('3');
  });

  it('should apply active class when hasActiveFilters is true', () => {
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.filter-button');
    expect(button.classList.contains('active')).toBe(true);
  });
});
