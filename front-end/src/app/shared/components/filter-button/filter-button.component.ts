import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.css']
})
export class FilterButtonComponent {
  @Input() activeFiltersCount: number = 0;
  @Input() hasActiveFilters: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  onButtonClick() {
    this.onClick.emit();
  }
}
