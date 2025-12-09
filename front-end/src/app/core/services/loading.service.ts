import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  public readonly loading$ = this.loading.asObservable();

  constructor() {}

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loading.next(true);
    }
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loading.next(false);
    }
  }
}
