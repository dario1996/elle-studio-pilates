import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-certificato-medico',
  templateUrl: './certificato-medico.component.html',
  styleUrl: './certificato-medico.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class CertificatoMedicoComponent {
  @Output() continua = new EventEmitter<any>();
  @Output() indietro = new EventEmitter<void>();

  certificatoForm: FormGroup;
  fileName: string = '';

  constructor(private fb: FormBuilder) {
    this.certificatoForm = this.fb.group({
      certificato: [null], // file upload, opzionale
      patologie: [null, Validators.required], // true/false
      descrizionePatologie: [''],
      obiettivi: ['']
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.certificatoForm.patchValue({ certificato: input.files[0] });
      this.fileName = input.files[0].name;
    }
  }

  onSubmit() {
    if (this.certificatoForm.valid) {
      this.continua.emit(this.certificatoForm.value);
    } else {
      this.certificatoForm.markAllAsTouched();
    }
  }
}
