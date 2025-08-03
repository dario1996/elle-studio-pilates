import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import {
  ImportModalComponent,
  ImportOption,
  ImportData,
} from '../../../../shared/components/import-modal/import-modal.component';
import * as XLSX from 'xlsx';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface AssegnazioniImportData {
  nominativo: string;
  corso: string;
  macroArgomenti?: string;
  dataInizio?: string;
  dataCompletamento?: string;
  stato?: string;
  esito?: string;
  fonteRichiesta?: string;
  impattoIsms?: string;
  modalita?: string;
  errors?: string[];
  isDuplicate?: boolean;
  canUpdate?: boolean;
  existingId?: number;
  existingData?: any;
}

@Component({
  selector: 'app-import-assegnazioni',
  standalone: true,
  imports: [CommonModule, FormsModule, ImportModalComponent],
  templateUrl: './import-assegnazioni.component.html',
  styleUrls: ['./import-assegnazioni.component.css'],
})
export class ImportAssegnazioniComponent implements OnInit {
  @Output() importCompleted = new EventEmitter<void>();

  selectedFile: File | null = null;
  isProcessing = false;
  previewData: ImportData[] = [];
  showPreview = false;
  validationErrors: string[] = [];

  // Standardized properties for ImportModalComponent
  supportedFormats = ['.xlsx', '.xls'];
  expectedHeaders = [
    'Nominativo',
    'Corso',
    'Macro-argomenti',
    'Data Inizio',
    'Data Completamento',
    'Stato',
    'Esito',
    'Fonte Richiesta',
    'Impatto ISMS',
    'Modalità',
  ];

  importOptions: ImportOption[] = [
    {
      key: 'updateExisting',
      label: 'Aggiorna assegnazioni esistenti',
      value: false,
    },
    {
      key: 'skipErrors',
      label: 'Continua in caso di errori',
      value: true,
    },
    {
      key: 'creaCorsiMancanti',
      label: 'Crea automaticamente i corsi mancanti',
      value: true,
    },
  ];

  tableColumns = [
    { key: 'nominativo', label: 'Nominativo' },
    { key: 'corso', label: 'Corso' },
    { key: 'macroArgomenti', label: 'Macro-argomenti' },
    { key: 'dataInizio', label: 'Data Inizio' },
    { key: 'dataCompletamento', label: 'Data Completamento' },
    { key: 'stato', label: 'Stato' },
    { key: 'esito', label: 'Esito' },
    { key: 'fonteRichiesta', label: 'Fonte Richiesta' },
    { key: 'impattoIsms', label: 'Impatto ISMS' },
  ];

  constructor(
    private assegnazioniService: AssegnazioniService,
    private toastr: ToastrService,
    private modaleService: ModaleService,
  ) {}

  ngOnInit(): void {
    this.resetImport();
  }

  // Helper methods for standardized modal
  private getImportOption(key: string): boolean {
    const option = this.importOptions.find(opt => opt.key === key);
    return option ? option.value : false;
  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.processFile();
  }

  resetImport(): void {
    this.selectedFile = null;
    this.previewData = [];
    this.showPreview = false;
    this.validationErrors = [];
    this.isProcessing = false;
  }

  private processFile(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.validationErrors = [];

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          this.validationErrors.push('Il file è vuoto');
          this.isProcessing = false;
          return;
        }

        const headers = jsonData[0] as string[];
        const expectedHeaders = [
          'Nominativo',
          'Corso',
          'Macro-argomenti',
          'Data inizio',
          'Data fine',
          'Stato',
          'Esito',
          'Fonte richiesta',
          'Impatto ISMS',
          'Modalità',
        ];

        // Validate headers
        if (!this.validateHeaders(headers, expectedHeaders)) {
          this.isProcessing = false;
          return;
        }

        console.log('Excel headers found:', headers);
        console.log('Expected headers:', expectedHeaders);

        // Process data rows
        this.previewData = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || !row[0]) continue; // Skip empty rows

          console.log(`Processing row ${i}:`, row);
          const assegnazione = this.mapRowToAssegnazione(row, headers);
          this.previewData.push(assegnazione);
        }

        this.validateData();
        this.checkDuplicates();
        this.showPreview = true;
        this.isProcessing = false;
      } catch (error) {
        this.validationErrors.push(
          'Errore durante la lettura del file: ' + error,
        );
        this.isProcessing = false;
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  private validateHeaders(
    headers: string[],
    expectedHeaders: string[],
  ): boolean {
    const missingHeaders = expectedHeaders.filter(
      expected =>
        !headers.some(header =>
          header?.toLowerCase().includes(expected.toLowerCase()),
        ),
    );

    if (missingHeaders.length > 0) {
      this.validationErrors.push(
        `Intestazioni mancanti: ${missingHeaders.join(', ')}`,
      );
      return false;
    }

    return true;
  }

  private mapRowToAssegnazione(
    row: any[],
    headers: string[],
  ): AssegnazioniImportData {
    const assegnazione: AssegnazioniImportData = {
      nominativo: '',
      corso: '',
      errors: [],
    };

    headers.forEach((header, index) => {
      if (!header) return;
      const value = row[index] ? String(row[index]).trim() : '';
      const headerLower = header.toLowerCase();

      if (headerLower.includes('nominativo')) {
        assegnazione.nominativo = value;
      } else if (headerLower.includes('corso')) {
        assegnazione.corso = value;
      } else if (headerLower.includes('macro-argomenti')) {
        assegnazione.macroArgomenti = value;
      } else if (headerLower.includes('data inizio')) {
        assegnazione.dataInizio = /^\d+$/.test(value)
          ? this.excelSerialToDateString(value) || value
          : value;
      } else if (
        headerLower.includes('data fine') ||
        headerLower.includes('data completamento')
      ) {
        assegnazione.dataCompletamento = /^\d+$/.test(value)
          ? this.excelSerialToDateString(value) || value
          : value;
      } else if (headerLower.includes('stato')) {
        assegnazione.stato = value;
      } else if (headerLower.includes('esito')) {
        assegnazione.esito = value;
      } else if (headerLower.includes('fonte richiesta')) {
        assegnazione.fonteRichiesta = value;
      } else if (headerLower.includes('impatto isms')) {
        assegnazione.impattoIsms = value;
      } else if (headerLower.includes('modalità') || headerLower.includes('modalita')) {
        assegnazione.modalita = value;
      }
    });

    return assegnazione;
  }

  private validateData(): void {
    this.previewData.forEach((assegnazione, index) => {
      assegnazione.errors = [];

      // Validate required fields
      if (!assegnazione['nominativo']) {
        assegnazione.errors!.push('Nominativo è obbligatorio');
      }

      if (!assegnazione['corso']) {
        assegnazione.errors!.push('Corso è obbligatorio');
      }

      // Validate dates
      if (
        assegnazione['dataInizio'] &&
        !this.isValidDate(assegnazione['dataInizio'])
      ) {
        assegnazione.errors!.push('Formato data inizio non valido');
      }

      if (
        assegnazione['dataCompletamento'] &&
        !this.isValidDate(assegnazione['dataCompletamento'])
      ) {
        assegnazione.errors!.push('Formato data completamento non valido');
      }

      // Validate ISMS impact
      if (
        assegnazione['impattoIsms'] &&
        !this.isValidBoolean(assegnazione['impattoIsms'])
      ) {
        assegnazione.errors!.push(
          'Impatto ISMS deve essere Sì, Si, No, true o false',
        );
      }
    });
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString) return true;

    const formats = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
    ];

    // Se è un seriale Excel, accetta solo se convertibile in data
    if (/^\d+$/.test(dateString)) {
      return !!this.excelSerialToDateString(dateString);
    }

    return formats.some(format => format.test(dateString));
  }

  private isValidBoolean(value: string): boolean {
    if (!value) return true;
    const lowerValue = value.toLowerCase();
    return ['sì', 'si', 'no', 'true', 'false'].includes(lowerValue);
  }

  private checkDuplicates(): void {
    // Mark potential duplicates based on nominativo + corso
    const seen = new Map<string, ImportData>();

    this.previewData.forEach(assegnazione => {
      const key =
        `${assegnazione['nominativo']}-${assegnazione['corso']}`.toLowerCase();

      if (seen.has(key)) {
        assegnazione.isDuplicate = true;
        seen.get(key)!.isDuplicate = true;
      } else {
        seen.set(key, assegnazione);
      }
    });
  }

  getValidAssegnazioni(): ImportData[] {
    return this.previewData.filter(a => !a.errors || a.errors.length === 0);
  }

  getDuplicateCount(): number {
    return this.previewData.filter(a => a.isDuplicate).length;
  }

  getErrorCount(): number {
    return this.previewData.filter(a => a.errors && a.errors.length > 0).length;
  }

  getRowClass(assegnazione: AssegnazioniImportData): string {
    if (assegnazione.errors && assegnazione.errors.length > 0) {
      return 'table-danger';
    }
    if (assegnazione.isDuplicate) {
      return 'table-warning';
    }
    return 'table-success';
  }

  performImport(): void {
    const validAssegnazioni = this.getValidAssegnazioni();

    if (validAssegnazioni.length === 0) {
      this.toastr.error('Nessuna assegnazione valida da importare');
      return;
    }

    this.isProcessing = true;

    // Map to backend format
    const importData = {
      assegnazioni: validAssegnazioni.map(a => ({
        nominativo: a['nominativo'],
        corso: a['corso'],
        argomento: (a['macroArgomenti'] && a['macroArgomenti'].trim()) || null,
        dataInizio: a['dataInizio'] || null,
        dataCompletamento: a['dataCompletamento'] || null,
        stato: a['stato'] || null,
        esito: a['esito'] || null,
        fonteRichiesta: a['fonteRichiesta'] || null,
        impattoIsms: a['impattoIsms'] || null,
        modalita: a['modalita'] || null,
      })),
      options: {
        updateExisting: this.getImportOption('updateExisting'),
        skipErrors: this.getImportOption('skipErrors'),
        creaCorsiMancanti: this.getImportOption('creaCorsiMancanti'),
      },
    };

    // Debug logging
    console.log('Import data being sent:', JSON.stringify(importData, null, 2));
    console.log('First assegnazione sample:', importData.assegnazioni[0]);
    console.log(
      'Sample macroArgomenti from preview data:',
      validAssegnazioni[0]['macroArgomenti'],
    );

    this.assegnazioniService.bulkImport(importData).subscribe({
      next: (response: any) => {
        this.handleImportResponse(response);
      },
      error: (error: any) => {
        this.isProcessing = false;
        this.toastr.error("Errore durante l'importazione: " + error.message);
      },
    });
  }

  private handleImportResponse(response: any): void {
    this.isProcessing = false;

    const { successCount, errorCount, updatedCount, totalProcessed } = response;

    if (successCount > 0) {
      this.toastr.success(
        `${successCount} assegnazioni importate con successo`,
      );
    }

    if (updatedCount > 0) {
      this.toastr.info(`${updatedCount} assegnazioni aggiornate`);
    }

    if (errorCount > 0) {
      this.toastr.warning(`${errorCount} assegnazioni con errori`);
    }

    // Show detailed errors if any
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map(
        (error: any) => `Riga ${error.row}: ${error.message}`,
      );
      this.validationErrors = errorMessages;
    }

    // Close modal and refresh parent component
    if (successCount > 0 || updatedCount > 0) {
      this.importCompleted.emit();
      this.modaleService.chiudi();
    }
  }

  closeModal(): void {
    this.modaleService.chiudi();
  }

  onImportOptionsChanged(options: { [key: string]: any }): void {
    // Update the importOptions array with the new values
    this.importOptions.forEach(option => {
      if (options.hasOwnProperty(option.key)) {
        option.value = options[option.key];
      }
    });
  }

  onImportConfirmed(): void {
    this.performImport();
  }

  onImportCancelled(): void {
    this.resetImport();
  }

  onResetRequested(): void {
    this.resetImport();
  }

  private excelSerialToDateString(serial: string | number): string | null {
    const n = Number(serial);
    if (isNaN(n) || n < 1) return null;
    const date = new Date(Math.round((n - 25569) * 86400 * 1000));
    if (date.getFullYear() < 1900) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
