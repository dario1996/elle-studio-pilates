import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICorsi } from '../../../../shared/models/Corsi';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-dettaglio-corsi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-corsi.component.html',
  styleUrl: './dettaglio-corsi.component.css'
})
export class DettaglioCorsiComponent implements OnInit {
  dati: ICorsi | null = null;

  private modaleService = inject(ModaleService);

  ngOnInit() {
    this.modaleService.config$.subscribe(config => {
      this.dati = config?.dati;
    });
  }
}
