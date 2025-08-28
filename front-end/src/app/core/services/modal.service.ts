import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IModaleConfig } from '../../shared/models/ui/modal-config';

@Injectable({ providedIn: 'root' })
export class ModaleService {
  private configSubject = new BehaviorSubject<IModaleConfig | null>(null);
  config$ = this.configSubject.asObservable();

  private refreshListSubject = new Subject<void>();
  refreshList$ = this.refreshListSubject.asObservable();

  apri(config: IModaleConfig) {
    console.log('Apro modale con config:', config);
    this.configSubject.next(config);
  }

  chiudi() {
    this.configSubject.next(null);
  }

  emitRefreshList() {
    this.refreshListSubject.next();
  }
}
