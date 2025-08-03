import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-delete-confirm',
  imports: [],
  templateUrl: './delete-confirm.component.html',
  styleUrl: './delete-confirm.component.css'
})
export class DeleteConfirmComponent {
  @Input() messaggio: string = 'Sei sicuro di voler eliminare questo elemento?';
  @Output() conferma = new EventEmitter<void>();

  confermaForm() {
    this.conferma.emit();
  }
}
