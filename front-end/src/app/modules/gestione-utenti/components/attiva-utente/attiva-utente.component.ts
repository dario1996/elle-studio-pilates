import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { IPacchetti } from '../../../../shared/models/Pacchetti';
import { ModaleService } from '../../../../core/services/modal.service';
import { PacchettiService } from '../../../../core/services/data/pacchetti.service';

@Component({
  selector: 'app-attiva-utente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attiva-utente.component.html',
  styleUrls: ['./attiva-utente.component.css']
})
export class AttivaUtenteComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  
  attivazioneForm!: FormGroup;
  dati: IUsers | null = null;
  pacchettiDisponibili: IPacchetti[] = [];
  nomeCompleto: string = '';

  private modaleService = inject(ModaleService);
  private pacchettiService = inject(PacchettiService);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        this.nomeCompleto = this.dati?.nome && this.dati?.cognome 
          ? `${this.dati.nome} ${this.dati.cognome}`
          : this.dati?.username || '';
        
        if (this.attivazioneForm) {
          this.attivazioneForm.patchValue({
            pacchettiDisponibiliIds: this.dati?.pacchettiDisponibiliIds || []
          });
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
    this.attivazioneForm = this.fb.group({
      pacchettiDisponibiliIds: [
        this.dati?.pacchettiDisponibiliIds || []
      ]
    });
  }

  onSubmit(): void {
    this.conferma.emit({
      pacchettiDisponibiliIds: this.attivazioneForm.get('pacchettiDisponibiliIds')?.value || []
    });
  }

  confermaForm(): void {
    this.onSubmit();
  }

  // Metodi per gestione pacchetti
  isPacchettoSelected(pacchettoId: number): boolean {
    const ids = this.attivazioneForm.get('pacchettiDisponibiliIds')?.value || [];
    return ids.includes(pacchettoId);
  }

  togglePacchetto(pacchettoId: number): void {
    const currentIds = this.attivazioneForm.get('pacchettiDisponibiliIds')?.value || [];
    const index = currentIds.indexOf(pacchettoId);
    
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(pacchettoId);
    }
    
    this.attivazioneForm.patchValue({ pacchettiDisponibiliIds: [...currentIds] });
  }

  getSelectedPacchettiCount(): number {
    const ids = this.attivazioneForm.get('pacchettiDisponibiliIds')?.value || [];
    return ids.length;
  }
}
