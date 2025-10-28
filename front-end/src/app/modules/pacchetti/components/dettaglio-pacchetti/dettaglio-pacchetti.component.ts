import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPacchetti } from '../../../../shared/models/Pacchetti';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-dettaglio-pacchetti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-pacchetti.component.html',
  styleUrl: './dettaglio-pacchetti.component.css'
})
export class DettaglioPacchettiComponent implements OnInit {
  dati: IPacchetti | null = null;

  private modaleService = inject(ModaleService);

  ngOnInit() {
    this.modaleService.config$.subscribe(config => {
      this.dati = config?.dati;
    });
  }
}
