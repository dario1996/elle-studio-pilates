import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-disable-confirm',
  imports: [],
  templateUrl: './disable-confirm.component.html',
  styleUrl: './disable-confirm.component.css',
})
export class DisableConfirmComponent {
  @Input() messaggio: string = 'Sei sicuro di voler disattivare questo elemento?';
  @Output() conferma = new EventEmitter<void>();

  confermaForm() {
    this.conferma.emit();
  }
}
