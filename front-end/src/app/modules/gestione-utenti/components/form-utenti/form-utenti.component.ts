import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { IPacchetti } from '../../../../shared/models/Pacchetti';
import { ModaleService } from '../../../../core/services/modal.service';
import { PacchettiService } from '../../../../core/services/data/pacchetti.service';

@Component({
  selector: 'app-form-utenti',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-utenti.component.html',
  styleUrls: ['./form-utenti.component.css']
})
export class FormUtentiComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  
  utenteForm!: FormGroup;
  submitted = false;
  dati: IUsers | null = null;
  isEditMode = false;
  
  pacchettiDisponibili: IPacchetti[] = [];
  activeTab: 'dati' | 'pacchetti' | 'ruolo' = 'dati';

  private modaleService = inject(ModaleService);
  private pacchettiService = inject(PacchettiService);

  ruoliDisponibili = [
    { value: 'USER', label: 'Cliente' },
    { value: 'ADMIN', label: 'Amministratore' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        this.isEditMode = !!this.dati && !!this.dati.username;
        if (this.utenteForm) {
          this.patchFormValues();
        }
      }
    });
    this.loadPacchetti();
    this.initForm();
  }
  
  loadPacchetti(): void {
    this.pacchettiService.getListaPacchetti().subscribe({
      next: (pacchetti) => {
        this.pacchettiDisponibili = pacchetti.filter(p => p.attivo);
      },
      error: (error) => {
        console.error('Errore nel caricamento dei pacchetti:', error);
      }
    });
  }

  initForm(): void {
    this.utenteForm = this.fb.group({
      username: [
        this.dati?.username || '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        this.dati?.email || '',
        [Validators.required, Validators.email]
      ],
      nome: [
        this.dati?.nome || '',
        [Validators.required]
      ],
      cognome: [
        this.dati?.cognome || '',
        [Validators.required]
      ],
      codiceFiscale: [
        this.dati?.codiceFiscale || ''
      ],
      indirizzo: [
        this.dati?.indirizzo || ''
      ],
      città: [
        this.dati?.città || ''
      ],
      telefono: [
        this.dati?.telefono || ''
      ],
      certificatoMedico: [
        this.dati?.certificatoMedico || false
      ],
      ruoli: [
        this.dati?.ruoli || ['USER'],
        [Validators.required]
      ],
      patologie: [
        this.dati?.patologie || false
      ],
      descrizionePatologie: [
        this.dati?.descrizionePatologie || ''
      ],
      obiettivi: [
        this.dati?.obiettivi || ''
      ],
      pacchettiDisponibiliIds: [
        this.dati?.pacchettiDisponibiliIds || []
      ]
    });
    
    // Aggiungi listener per il cambio del valore di patologie
    this.utenteForm.get('patologie')?.valueChanges.subscribe(value => {
      const descrizioneControl = this.utenteForm.get('descrizionePatologie');
      if (value === true) {
        descrizioneControl?.setValidators([Validators.required]);
      } else {
        descrizioneControl?.clearValidators();
      }
      descrizioneControl?.updateValueAndValidity();
    });
  }

  private patchFormValues(): void {
    this.utenteForm.patchValue({
      username: this.dati?.username || '',
      email: this.dati?.email || '',
      nome: this.dati?.nome || '',
      cognome: this.dati?.cognome || '',
      codiceFiscale: this.dati?.codiceFiscale || '',
      indirizzo: this.dati?.indirizzo || '',
      città: this.dati?.città || '',
      telefono: this.dati?.telefono || '',
      certificatoMedico: this.dati?.certificatoMedico || false,
      ruoli: this.dati?.ruoli || ['USER'],
      patologie: this.dati?.patologie || false,
      descrizionePatologie: this.dati?.descrizionePatologie || '',
      obiettivi: this.dati?.obiettivi || '',
      pacchettiDisponibiliIds: this.dati?.pacchettiDisponibiliIds || []
    });
  }

  onSubmit(): void {
    this.submitted = true;
    console.log('📝 Form submitted');
    console.log('📋 Form valid:', this.utenteForm.valid);
    console.log('📦 Form values:', this.utenteForm.value);
    console.log('🏥 Patologie value:', this.utenteForm.get('patologie')?.value);
    
    if (this.utenteForm.invalid) {
      console.warn('⚠️ Form non valido, errori:', this.utenteForm.errors);
      // Vai alla tab con errori
      if (this.hasErrorsInTab('dati')) {
        this.activeTab = 'dati';
      } else if (this.hasErrorsInTab('ruolo')) {
        this.activeTab = 'ruolo';
      }
      return;
    }
    console.log('✅ Emetto conferma con valori:', this.utenteForm.value);
    this.conferma.emit(this.utenteForm.value);
  }

  confermaForm(): void {
    this.onSubmit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.utenteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.utenteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['email']) return 'Email non valida';
      if (field.errors['minlength']) return `${fieldName} troppo corto`;
      if (field.errors['maxlength']) return `${fieldName} troppo lungo`;
    }
    return '';
  }

  // Metodi per gestione pacchetti
  isPacchettoSelected(pacchettoId: number): boolean {
    const ids = this.utenteForm.get('pacchettiDisponibiliIds')?.value || [];
    return ids.includes(pacchettoId);
  }

  togglePacchetto(pacchettoId: number): void {
    const currentIds = this.utenteForm.get('pacchettiDisponibiliIds')?.value || [];
    const index = currentIds.indexOf(pacchettoId);
    
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(pacchettoId);
    }
    
    this.utenteForm.patchValue({ pacchettiDisponibiliIds: [...currentIds] });
  }

  getSelectedPacchettiCount(): number {
    const ids = this.utenteForm.get('pacchettiDisponibiliIds')?.value || [];
    return ids.length;
  }

  // Metodi per gestione ruoli
  isRuoloSelected(ruolo: string): boolean {
    const ruoli = this.utenteForm.get('ruoli')?.value || [];
    return ruoli.includes(ruolo);
  }

  selectRuolo(ruolo: string): void {
    this.utenteForm.patchValue({ ruoli: [ruolo] });
  }

  getRuoloDescription(ruolo: string): string {
    switch(ruolo) {
      case 'ADMIN':
        return 'Accesso completo a tutte le funzionalità di gestione';
      case 'USER':
        return 'Accesso standard per la prenotazione e acquisto lezioni';
      default:
        return '';
    }
  }

  // Metodi per validazione tabs
  hasErrorsInTab(tab: 'dati' | 'pacchetti' | 'ruolo'): boolean {
    switch(tab) {
      case 'dati':
        return this.isFieldInvalid('username') || 
               this.isFieldInvalid('email') || 
               this.isFieldInvalid('nome') || 
               this.isFieldInvalid('cognome');
      case 'ruolo':
        return this.isFieldInvalid('ruoli');
      case 'pacchetti':
        return false;
      default:
        return false;
    }
  }
}
