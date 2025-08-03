import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ButtonConfig {
  text: string;
  icon?: string;
  class?: string;
  action?: string;
}

export interface SearchFieldConfig {
  key: string;
  placeholder: string;
}

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [CommonModule, FormsModule /*, ...altri componenti */],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.css'
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showButton: boolean = false;
  @Input() buttonText: string = '';
  @Input() buttons: ButtonConfig[] = [];
  @Input() activeFiltersCount: number = 0;
  @Input() searchFields: SearchFieldConfig[] = [];

  @Output() buttonClick = new EventEmitter<void>();
  @Output() buttonActionClick = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<{ [key: string]: string }>();

  searchValues: { [key: string]: string } = {};


  // 🔥 NUOVO: Metodo per determinare le classi del pulsante
  getButtonClasses(button: ButtonConfig): string {
    // Se è il pulsante filtri, usa lo stile Double Take
    if (button.action === 'filter' || button.action === 'assegnazioni') {
      return 'btn-filter-fx';
    }
    
    // Per tutti gli altri pulsanti, usa le classi normali
    return button.class || 'btn-primary';
  }

  onSearchChange() {
    this.searchChange.emit({ ...this.searchValues });
  }
}

@NgModule({
  imports: [
    // ... altri moduli ...
    FormsModule
  ],
  // ... declarations, etc ...
})
export class AppModule { }
