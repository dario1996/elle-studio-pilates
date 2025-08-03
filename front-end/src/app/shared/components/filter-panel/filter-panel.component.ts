import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFiltroDef } from '../../models/ui/filtro-def';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css']
})
export class FilterPanelComponent implements OnInit, OnChanges {
  @Input() filtri: IFiltroDef[] = [];
  @Input() valori: { [key: string]: any } = {};
  @Input() isOpen: boolean = false;
  @Output() valoriChange = new EventEmitter<{ [key: string]: any }>();
  @Output() close = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<{ [key: string]: any }>();
  @Output() clearFilters = new EventEmitter<void>();

  // Internal copy of values for the panel
  tempValori: { [key: string]: any } = {};

  ngOnInit() {
    // Initialize temp values with current values
    this.tempValori = { ...this.valori };
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update temp values when input values change
    this.tempValori = { ...this.valori };
  }

  onClose() {
    // Reset temp values to original values when closing without applying
    this.tempValori = { ...this.valori };
    this.close.emit();
  }

  onApply() {
    // Apply the filters and close the panel
    this.applyFilters.emit(this.tempValori);
    this.close.emit();
  }

  onClear() {
    // Clear all filters
    this.tempValori = {};
    this.clearFilters.emit();
  }

  onChange(key: string, value: any) {
    this.tempValori = { ...this.tempValori, [key]: value };
  }

  // Check if there are any active filters
  hasActiveFilters(): boolean {
    return Object.values(this.tempValori).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  // Get count of active filters
  getActiveFiltersCount(): number {
    return Object.values(this.tempValori).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }

  // Check if filters have changed from applied state
  hasChanges(): boolean {
    const keys = new Set([...Object.keys(this.valori), ...Object.keys(this.tempValori)]);
    for (const key of keys) {
      if (this.valori[key] !== this.tempValori[key]) {
        return true;
      }
    }
    return false;
  }
}
