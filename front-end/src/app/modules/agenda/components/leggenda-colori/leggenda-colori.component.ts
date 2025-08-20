import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoLezione, TIPI_LEZIONE_CONFIG } from '../../../../shared/models/Lezione';

@Component({
  selector: 'app-leggenda-colori',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leggenda-colori.component.html',
  styleUrl: './leggenda-colori.component.css'
})
export class LeggendaColoriComponent {
  tipiLezione = Object.values(TipoLezione);
  tipiLezioneConfig = TIPI_LEZIONE_CONFIG;

  getPrimiTreTipi(): TipoLezione[] {
    return this.tipiLezione.slice(0, 3);
  }

  getUltimiTreTipi(): TipoLezione[] {
    return this.tipiLezione.slice(3, 6);
  }

  getColoreByTipo(tipo: TipoLezione): string {
    return this.tipiLezioneConfig[tipo].colore;
  }

  getLabelByTipo(tipo: TipoLezione): string {
    return this.tipiLezioneConfig[tipo].label;
  }
}
