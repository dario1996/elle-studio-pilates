import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { IModaleConfig } from '../../shared/models/ui/modal-config';

@Injectable({ providedIn: 'root' })
export class ModaleService {
  private configSubject = new BehaviorSubject<IModaleConfig | null>(null);
  config$ = this.configSubject.asObservable();

  apri(config: IModaleConfig) {
    console.log('Apro modale con config:', config);
    this.configSubject.next(config);
  }

  chiudi() {
    this.configSubject.next(null);
  }
}
