import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { IModaleConfig } from '../../shared/models/ui/modal-config';
import { ModaleService } from '../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnDestroy {
  config: IModaleConfig | null = null;
  private dynamicComponentRef?: ComponentRef<any>;
  private dynamicTarget?: ViewContainerRef;

  @ViewChild('dynamicTarget', { read: ViewContainerRef })
  set dynamicTargetSetter(vc: ViewContainerRef | undefined) {
    this.dynamicTarget = vc;
    if (vc && this.config && this.config.componente) {
      this.loadDynamicComponent();
    }
  }

  constructor(public modaleService: ModaleService) {
    this.modaleService.config$.subscribe(conf => {
      this.config = conf;
      if (!conf && this.dynamicTarget) {
        this.dynamicTarget.clear();
      }
    });
  }

  loadDynamicComponent() {
    if (this.dynamicTarget && this.config) {
      this.dynamicTarget.clear();
      this.dynamicComponentRef = this.dynamicTarget.createComponent(this.config.componente);
      if (this.config.dati) {
        Object.assign(this.dynamicComponentRef.instance, this.config.dati);
      }
      if (
        this.config.onConferma &&
        this.dynamicComponentRef.instance.conferma &&
        this.dynamicComponentRef.instance.conferma.subscribe
      ) {
        this.dynamicComponentRef.instance.conferma.subscribe((formValue: any) => {
          this.config?.onConferma?.(formValue);
          this.chiudi();
        });
      }
      
      // Handle importCompleted event for ImportDipendentiComponent
      if (
        this.config.onConferma &&
        this.dynamicComponentRef.instance.importCompleted &&
        this.dynamicComponentRef.instance.importCompleted.subscribe
      ) {
        this.dynamicComponentRef.instance.importCompleted.subscribe(() => {
          this.config?.onConferma?.(null);
          // Don't close the modal here, let the component handle it
        });
      }
    }
  }

  conferma() {
    if (
      this.dynamicComponentRef &&
      this.dynamicComponentRef.instance &&
      typeof this.dynamicComponentRef.instance.confermaForm === 'function'
    ) {
      this.dynamicComponentRef.instance.confermaForm();
    }
  }

  chiudi() {
    this.modaleService.chiudi();
    if (this.dynamicComponentRef) {
      this.dynamicComponentRef.destroy();
    }
  }

  onBackdropClick(event: Event) {
    // Close modal when clicking on the backdrop (outside the modal content)
    if (event.target === event.currentTarget) {
      this.chiudi();
    }
  }

  ngOnDestroy() {
    this.chiudi();
  }
}
