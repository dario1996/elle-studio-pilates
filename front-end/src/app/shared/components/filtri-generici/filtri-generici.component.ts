import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IFiltroDef } from '../../models/ui/filtro-def';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtri-generici',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtri-generici.component.html',
  styleUrl: './filtri-generici.component.css'
})
export class FiltriGenericiComponent {
  @Input() filtri: IFiltroDef[] = [];
  @Input() valori: { [key: string]: any } = {};
  @Output() valoriChange = new EventEmitter<{ [key: string]: any }>();

  onChange(key: string, value: any) {
    this.valori = { ...this.valori, [key]: value };
    this.valoriChange.emit(this.valori);
  }
}
