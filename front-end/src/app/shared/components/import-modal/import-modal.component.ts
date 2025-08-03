import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImportOption {
  key: string;
  label: string;
  value: boolean;
}

export interface ImportData {
  [key: string]: any;
  errors?: string[];
  isDuplicate?: boolean;
  canUpdate?: boolean;
}

export interface ImportStats {
  total: number;
  valid: number;
  duplicates: number;
  errors: number;
}

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css']
})
export class ImportModalComponent implements OnInit {
  @Input() title: string = 'Importazione Dati';
  @Input() supportedFormats: string[] = ['.xlsx', '.xls'];
  @Input() expectedHeaders: string[] = [];
  @Input() previewData: ImportData[] = [];
  @Input() importOptions: ImportOption[] = [];
  @Input() isProcessing: boolean = false;
  @Input() showPreview: boolean = false;
  @Input() validationErrors: string[] = [];
  @Input() tableColumns: { key: string; label: string; render?: (item: any) => string }[] = [];
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() importOptionsChanged = new EventEmitter<{ [key: string]: any }>();
  @Output() importConfirmed = new EventEmitter<void>();
  @Output() importCancelled = new EventEmitter<void>();
  @Output() resetRequested = new EventEmitter<void>();

  selectedFile: File | null = null;
  optionsExpanded: boolean = false;

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileSelected.emit(this.selectedFile);
    }
  }

  onOptionChange(): void {
    const options: { [key: string]: any } = {};
    this.importOptions.forEach(option => {
      options[option.key] = option.value;
    });
    this.importOptionsChanged.emit(options);
  }

  onImportConfirm(): void {
    this.importConfirmed.emit();
  }

  onImportCancel(): void {
    this.importCancelled.emit();
  }

  onResetImport(): void {
    this.resetRequested.emit();
  }

  getStats(): ImportStats {
    const total = this.previewData.length;
    const valid = this.getValidData().length;
    const duplicates = this.previewData.filter(item => item.isDuplicate).length;
    const errors = this.previewData.filter(item => item.errors && item.errors.length > 0).length;
    
    return { total, valid, duplicates, errors };
  }

  getValidData(): ImportData[] {
    return this.previewData.filter(item => {
      const hasBasicErrors = item.errors && item.errors.some(error => 
        !error.toLowerCase().includes('duplicato') && !error.toLowerCase().includes('esistente')
      );
      
      if (hasBasicErrors) {
        return false;
      }
      
      if (item.isDuplicate) {
        const updateOption = this.importOptions.find(opt => opt.key === 'updateExisting');
        return item.canUpdate && updateOption?.value;
      }
      
      return true;
    });
  }

  getRowClass(item: ImportData): string {
    if (item.errors && item.errors.length > 0) {
      return 'table-danger';
    }
    if (item.isDuplicate) {
      return 'table-warning';
    }
    return 'table-success';
  }

  getRowIcon(item: ImportData): string {
    if (item.errors && item.errors.length > 0) {
      return 'fas fa-exclamation-circle text-danger';
    }
    if (item.isDuplicate) {
      return 'fas fa-exclamation-triangle text-warning';
    }
    return 'fas fa-check-circle text-success';
  }

  renderCellValue(item: ImportData, column: { key: string; label: string; render?: (item: any) => string }): string {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key] || '-';
  }

  toggleOptions(): void {
    this.optionsExpanded = !this.optionsExpanded;
  }

  getFormattedFileTypes(): string {
    return this.supportedFormats.join(', ');
  }

  hasValidationErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  getErrorDetails(): { row: number; data: ImportData }[] {
    return this.previewData
      .map((item, index) => ({ row: index + 1, data: item }))
      .filter(({ data }) => data.errors && data.errors.length > 0);
  }
}
