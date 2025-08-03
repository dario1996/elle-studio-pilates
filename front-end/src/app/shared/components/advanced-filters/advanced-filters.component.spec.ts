import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedFiltersComponent } from './advanced-filters.component';

describe('AdvancedFiltersComponent', () => {
  let component: AdvancedFiltersComponent;
  let fixture: ComponentFixture<AdvancedFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdvancedFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open filter panel', () => {
    component.openFilterPanel();
    expect(component.isFilterPanelOpen).toBe(true);
  });

  it('should close filter panel', () => {
    component.isFilterPanelOpen = true;
    component.closeFilterPanel();
    expect(component.isFilterPanelOpen).toBe(false);
  });

  it('should emit events when filters are applied', () => {
    spyOn(component.valoriChange, 'emit');
    spyOn(component.filtersApplied, 'emit');
    
    const testFilters = { test: 'value' };
    component.onApplyFilters(testFilters);
    
    expect(component.valoriChange.emit).toHaveBeenCalledWith(testFilters);
    expect(component.filtersApplied.emit).toHaveBeenCalledWith(testFilters);
  });

  it('should clear filters and emit events', () => {
    spyOn(component.valoriChange, 'emit');
    spyOn(component.filtersApplied, 'emit');
    
    component.valori = { test: 'value' };
    component.onClearFilters();
    
    expect(component.valori).toEqual({});
    expect(component.valoriChange.emit).toHaveBeenCalledWith({});
    expect(component.filtersApplied.emit).toHaveBeenCalledWith({});
  });
});
