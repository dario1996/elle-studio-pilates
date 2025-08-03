import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterButtonComponent } from '../filter-button/filter-button.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { IFiltroDef } from '../../models/ui/filtro-def';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, FilterButtonComponent, FilterPanelComponent],
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css']
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() filtri: IFiltroDef[] = [];
  @Input() valori: { [key: string]: any } = {};
  @Output() valoriChange = new EventEmitter<{ [key: string]: any }>();
  @Output() filtersApplied = new EventEmitter<{ [key: string]: any }>();

  isFilterPanelOpen = false;

  ngOnInit() {
    // Ensure we have initial values
    if (!this.valori) {
      this.valori = {};
    }
  }

  openFilterPanel() {
    this.isFilterPanelOpen = true;
  }

  closeFilterPanel() {
    this.isFilterPanelOpen = false;
  }

  onApplyFilters(filters: { [key: string]: any }) {
    this.valori = { ...filters };
    this.valoriChange.emit(this.valori);
    this.filtersApplied.emit(this.valori);
  }

  onClearFilters() {
    this.valori = {};
    this.valoriChange.emit(this.valori);
    this.filtersApplied.emit(this.valori);
  }

  // Helper methods for the filter button
  hasActiveFilters(): boolean {
    return Object.values(this.valori).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  getActiveFiltersCount(): number {
    return Object.values(this.valori).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }
}
