import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterPanelComponent } from './filter-panel.component';
import { FormsModule } from '@angular/forms';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent, FormsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when close button is clicked', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit applyFilters event when apply button is clicked', () => {
    spyOn(component.applyFilters, 'emit');
    component.onApply();
    expect(component.applyFilters.emit).toHaveBeenCalledWith(component.tempValori);
  });

  it('should emit clearFilters event when clear button is clicked', () => {
    spyOn(component.clearFilters, 'emit');
    component.onClear();
    expect(component.clearFilters.emit).toHaveBeenCalled();
  });

  it('should detect active filters correctly', () => {
    component.tempValori = { test: 'value' };
    expect(component.hasActiveFilters()).toBe(true);
    
    component.tempValori = {};
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should count active filters correctly', () => {
    component.tempValori = { test1: 'value1', test2: 'value2', test3: '' };
    expect(component.getActiveFiltersCount()).toBe(2);
  });
});
