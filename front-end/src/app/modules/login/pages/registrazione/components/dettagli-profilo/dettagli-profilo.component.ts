import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { codiceFiscaleValidator } from './codice-fiscale.validator';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dettagli-profilo',
  templateUrl: './dettagli-profilo.component.html',
  styleUrls: ['./dettagli-profilo.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class DettagliProfiloComponent implements OnInit {
  @Input() initialData: any = {};
  @Output() continua = new EventEmitter<any>();

  profiloForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profiloForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      codiceFiscale: ['', [Validators.required, codiceFiscaleValidator()]]
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.profiloForm.patchValue(this.initialData);
    }
  }

  onSubmit() {
    if (this.profiloForm.valid) {
      this.continua.emit(this.profiloForm.value);
    } else {
      this.profiloForm.markAllAsTouched();
    }
  }
}
