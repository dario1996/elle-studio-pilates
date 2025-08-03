import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { ImportModalComponent, ImportOption, ImportData } from '../../../../shared/components/import-modal/import-modal.component';
import * as XLSX from 'xlsx';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface DipendentiImportData extends ImportData {
  nominativo: string;
  dataCessazione?: string;
  isms?: string;
  ruolo: string;
  azienda: string;
  sede?: string;
  community?: string;
  responsabile?: string;
  existingId?: number;
  existingData?: any;
}

@Component({
  selector: 'app-import-dipendenti',
  standalone: true,
  imports: [CommonModule, FormsModule, ImportModalComponent],
  templateUrl: './import-dipendenti.component.html',
  styleUrls: ['./import-dipendenti.component.css']
})
export class ImportDipendentiComponent implements OnInit {
  @Output() importCompleted = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  isProcessing = false;
  previewData: DipendentiImportData[] = [];
  showPreview = false;
  validationErrors: string[] = [];
  
  supportedFormats = ['.xlsx', '.xls'];
  expectedHeaders = [
    'Nominativo',
    'Data cessazione',
    'ISMS',
    'Ruolo',
    'Azienda',
    'Sede',
    'Community',
    'Account/Responsabile'
  ];
  
  tableColumns = [
    { key: 'nominativo', label: 'Nominativo' },
    { key: 'ruolo', label: 'Ruolo' },
    { key: 'azienda', label: 'Azienda' },
    { key: 'sede', label: 'Sede' },
    { key: 'isms', label: 'ISMS' },
    { key: 'dataCessazione', label: 'Data Cessazione' }
  ];
  
  importOptions: ImportOption[] = [
    {
      key: 'updateExisting',
      label: 'Aggiorna dipendenti esistenti',
      value: false
    },
    {
      key: 'skipErrors',
      label: 'Salta righe con errori',
      value: true
    }
  ];
  
  constructor(
    private dipendentiService: DipendentiService,
    private toastr: ToastrService,
    private modaleService: ModaleService
  ) {}

  ngOnInit(): void {}

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.processFile();
  }

  onImportOptionsChanged(options: { [key: string]: any }): void {
    this.importOptions.forEach(option => {
      if (options[option.key] !== undefined) {
        option.value = options[option.key];
      }
    });
  }

  onImportConfirmed(): void {
    this.importData();
  }

  onImportCancelled(): void {
    this.modaleService.chiudi();
  }

  onResetRequested(): void {
    this.resetImport();
  }

  private getImportOption(key: string): boolean {
    const option = this.importOptions.find(opt => opt.key === key);
    return option ? option.value : false;
  }

  private processFile(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.validationErrors = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header mapping
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          this.validationErrors.push('Il file deve contenere almeno una riga di intestazione e una riga di dati');
          this.isProcessing = false;
          return;
        }

        // Expected headers based on requirements
        const headers = jsonData[0] as string[];
        const expectedHeaders = [
          'Nominativo',
          'Data cessazione',
          'ISMS',
          'Ruolo',
          'Azienda',
          'Sede',
          'Community',
          'Account/Responsabile'
        ];

        // Validate headers
        if (!this.validateHeaders(headers, expectedHeaders)) {
          this.isProcessing = false;
          return;
        }

        // Process data rows
        this.previewData = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || !row[0]) continue; // Skip empty rows

          const dipendente = this.mapRowToDipendente(row, headers);
          this.previewData.push(dipendente);
        }

        this.validateData();
        this.checkDuplicates();
        this.showPreview = true;
        this.isProcessing = false;

      } catch (error) {
        this.validationErrors.push('Errore durante la lettura del file: ' + error);
        this.isProcessing = false;
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  private validateHeaders(headers: string[], expectedHeaders: string[]): boolean {
    const missingHeaders = expectedHeaders.filter(expected => 
      !headers.some(header => header?.toLowerCase().includes(expected.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      this.validationErrors.push(`Intestazioni mancanti: ${missingHeaders.join(', ')}`);
      return false;
    }

    return true;
  }

  private mapRowToDipendente(row: any[], headers: string[]): DipendentiImportData {
    const dipendente: DipendentiImportData = {
      nominativo: '',
      ruolo: '',
      azienda: '',
      errors: []
    };

    headers.forEach((header, index) => {
      const value = row[index]?.toString().trim() || '';
      
      switch (header.toLowerCase()) {
        case 'nominativo':
          dipendente.nominativo = value;
          break;
        case 'data cessazione':
          dipendente.dataCessazione = value;
          break;
        case 'isms':
          dipendente.isms = value;
          break;
        case 'ruolo':
          dipendente.ruolo = value;
          break;
        case 'azienda':
          dipendente.azienda = value;
          break;
        case 'sede':
          dipendente.sede = value;
          break;
        case 'community':
          dipendente.community = value;
          break;
        case 'account/responsabile':
          dipendente.responsabile = value;
          break;
      }
    });

    return dipendente;
  }

  private validateData(): void {
    this.previewData.forEach((dipendente, index) => {
      dipendente.errors = [];

      // Required fields validation
      if (!dipendente.nominativo) {
        dipendente.errors.push('Nominativo è obbligatorio');
      }
      if (!dipendente.ruolo) {
        dipendente.errors.push('Ruolo è obbligatorio');
      }
      if (!dipendente.azienda) {
        dipendente.errors.push('Azienda è obbligatoria');
      }

      // Email validation from nominativo - we'll need to handle this in the backend
      // For now, we'll just check if nominativo contains spaces (nome + cognome)
      if (dipendente.nominativo && !dipendente.nominativo.includes(' ')) {
        dipendente.errors.push('Nominativo deve contenere nome e cognome separati da spazio');
      }

      // Date validation
      if (dipendente.dataCessazione) {
        const date = new Date(dipendente.dataCessazione);
        if (isNaN(date.getTime())) {
          dipendente.errors.push('Data cessazione non valida');
        }
      }

      // ISMS validation
      if (dipendente.isms && !['SI', 'NO'].includes(dipendente.isms)) {
        dipendente.errors.push('ISMS deve essere "SI" o "NO"');
      }
    });
  }

  private checkDuplicates(): void {
    // Prepare data for duplicate check
    const dipendentiForCheck = this.previewData.map(dipendente => ({
      nominativo: dipendente.nominativo,
      dataCessazione: dipendente.dataCessazione,
      isms: dipendente.isms,
      ruolo: dipendente.ruolo,
      azienda: dipendente.azienda,
      sede: dipendente.sede,
      community: dipendente.community,
      responsabile: dipendente.responsabile
    }));

    this.dipendentiService.checkDuplicates(dipendentiForCheck).subscribe({
      next: (response) => {
        this.processDuplicateInfo(response.duplicates);
      },
      error: (error) => {
        console.error('Errore durante il controllo duplicati:', error);
        // Continue without duplicate info if check fails
      }
    });
  }

  private processDuplicateInfo(duplicates: any[]): void {
    duplicates.forEach(duplicate => {
      const index = duplicate.index;
      if (index < this.previewData.length) {
        this.previewData[index].isDuplicate = duplicate.isDuplicate;
        this.previewData[index].canUpdate = duplicate.canUpdate;
        this.previewData[index].existingId = duplicate.existingId;
        this.previewData[index].existingData = duplicate.existingData;
        
        // Add warning for duplicates
        if (duplicate.isDuplicate) {
          if (!this.previewData[index].errors) {
            this.previewData[index].errors = [];
          }
          
          if (duplicate.canUpdate) {
            this.previewData[index].errors!.push('Dipendente già esistente - può essere aggiornato');
          } else {
            this.previewData[index].errors!.push('Dipendente già esistente - nessuna modifica rilevata');
          }
        }
      }
    });
  }

  hasValidationErrors(): boolean {
    return this.validationErrors.length > 0 || 
           this.previewData.some(d => d.errors && d.errors.length > 0);
  }

  getValidDipendenti(): DipendentiImportData[] {
    return this.previewData.filter(d => {
      // Check if has basic validation errors (excluding duplicate warnings)
      const hasBasicErrors = d.errors && d.errors.some(error => 
        !error.includes('Dipendente già esistente')
      );
      
      if (hasBasicErrors) {
        return false;
      }
      
      // If it's a duplicate, check if it can be updated and updateExisting is enabled
      if (d.isDuplicate) {
        return d.canUpdate && this.getImportOption('updateExisting');
      }
      
      // Non-duplicate valid rows
      return true;
    });
  }

  hasErrorsInData(): boolean {
    return this.previewData.some(d => d.errors && d.errors.length > 0);
  }

  getDuplicateCount(): number {
    return this.previewData.filter(d => d.isDuplicate).length;
  }

  getErrorCount(): number {
    return this.previewData.filter(d => this.hasErrors(d)).length;
  }

  hasErrors(dipendente: DipendentiImportData): boolean {
    if (!dipendente.errors || dipendente.errors.length === 0) {
      return false;
    }
    
    // Check if all errors are duplicate-related
    const onlyDuplicateErrors = dipendente.errors.every(error => 
      error.includes('Dipendente già esistente')
    );
    
    if (onlyDuplicateErrors && dipendente.isDuplicate) {
      // If it's a duplicate that can be updated and updateExisting is enabled, it's not an error
      return !(dipendente.canUpdate && this.getImportOption('updateExisting'));
    }
    
    // Has other validation errors
    return true;
  }

  importData(): void {
    if (!this.showPreview || this.hasValidationErrors()) {
      this.toastr.error('Correggere tutti gli errori prima di procedere');
      return;
    }

    const validData = this.getValidDipendenti();
    if (validData.length === 0) {
      this.toastr.error('Nessun dato valido da importare');
      return;
    }

    this.isProcessing = true;
    
    // Prepara i dati per l'API backend
    const dipendentiForImport = validData.map(dipendente => ({
      nominativo: dipendente.nominativo,
      dataCessazione: dipendente.dataCessazione,
      isms: dipendente.isms,
      ruolo: dipendente.ruolo,
      azienda: dipendente.azienda,
      sede: dipendente.sede,
      community: dipendente.community,
      responsabile: dipendente.responsabile
    }));

    // Chiama il backend per l'importazione
    this.dipendentiService.bulkImport(dipendentiForImport, this.importOptions).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.handleImportResponse(response);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Errore durante l\'importazione:', error);
        this.toastr.error('Errore durante l\'importazione: ' + (error.error?.message || error.message));
      }
    });
  }

  private handleImportResponse(response: any): void {
    const { totalProcessed, successCount, errorCount, updatedCount, errors } = response;
    
    if (successCount > 0) {
      this.toastr.success(`Importazione completata! ${successCount} dipendenti importati con successo`);
    }
    
    if (updatedCount > 0) {
      this.toastr.info(`${updatedCount} dipendenti aggiornati`);
    }
    
    if (errorCount > 0) {
      this.toastr.warning(`${errorCount} dipendenti non sono stati importati a causa di errori`);
      
      // Mostra i dettagli degli errori nei log
      if (errors && errors.length > 0) {
        console.warn('Errori di importazione:', errors);
      }
    }
    
    if (successCount === 0 && updatedCount === 0) {
      this.toastr.error('Nessun dipendente è stato importato');
    } else {
      // Emit event to refresh the dipendenti list in parent component
      this.importCompleted.emit();
      
      // Chiudi il modal solo se ci sono stati successi
      setTimeout(() => {
        this.modaleService.chiudi();
      }, 2000);
    }
  }

  cancelImport(): void {
    this.modaleService.chiudi();
  }

  resetImport(): void {
    this.selectedFile = null;
    this.previewData = [];
    this.showPreview = false;
    this.validationErrors = [];
    this.isProcessing = false;
    
    // Reset import options to defaults
    this.importOptions.forEach(option => {
      if (option.key === 'updateExisting') {
        option.value = false;
      } else if (option.key === 'skipErrors') {
        option.value = true;
      }
    });
  }

  onImportOptionsChange(): void {
    // Refresh validation when import options change
    if (this.showPreview) {
      this.validateData();
    }
  }
}
