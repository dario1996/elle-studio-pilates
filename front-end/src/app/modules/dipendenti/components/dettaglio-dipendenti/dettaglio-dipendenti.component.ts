import { Component, OnInit, inject } from '@angular/core';
import { ModaleService } from '../../../../core/services/modal.service';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dettaglio-dipendenti',
  templateUrl: './dettaglio-dipendenti.component.html',
  styleUrl: './dettaglio-dipendenti.component.css',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent]
})
export class DettaglioDipendentiComponent implements OnInit {
  dati: any;

  private modaleService = inject(ModaleService);

  ngOnInit() {
    this.modaleService.config$.subscribe(config => {
      this.dati = config?.dati;
    });
  }
}
