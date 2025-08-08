import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrazioneService } from '../../../../../../shared/services/registrazione.service';

@Component({
  selector: 'app-certificato-medico',
  templateUrl: './certificato-medico.component.html',
  styleUrl: './certificato-medico.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class CertificatoMedicoComponent implements OnInit {
  @Input() initialData: any = {};
  @Output() continua = new EventEmitter<any>();
  @Output() indietro = new EventEmitter<void>();

  certificatoForm: FormGroup;
  fileName: string = '';
  isUploading: boolean = false;
  uploadError: string = '';

  constructor(
    private fb: FormBuilder,
    private registrazioneService: RegistrazioneService
  ) {
    this.certificatoForm = this.fb.group({
      certificato: [null], // file upload, opzionale
      patologie: [null, Validators.required], // true/false
      descrizionePatologie: [''],
      obiettivi: ['']
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.certificatoForm.patchValue({
        patologie: this.initialData.patologie,
        descrizionePatologie: this.initialData.descrizionePatologie,
        obiettivi: this.initialData.obiettivi
      });
      this.fileName = this.initialData.certificatoMedico || '';
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;
      this.certificatoForm.patchValue({ certificato: file });
      
      // Per ora salviamo solo il nome del file,
      // l'upload verrà fatto quando l'utente completa la registrazione
      this.uploadError = '';
    }
  }

  onSubmit() {
    if (this.certificatoForm.valid) {
      const formData = { ...this.certificatoForm.value };
      if (this.fileName && !formData.certificato) {
        formData.certificatoMedico = this.fileName;
      }
      this.continua.emit(formData);
    } else {
      this.certificatoForm.markAllAsTouched();
    }
  }
}
