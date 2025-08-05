import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-email-password',
  templateUrl: './email-password.component.html',
  styleUrl: './email-password.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class EmailPasswordComponent {
  @Output() continua = new EventEmitter<any>();
  @Output() indietro = new EventEmitter<void>();

  emailForm: FormGroup;
  showPassword = false;
  showConfirm = false;

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.emailForm.valid) {
      this.continua.emit(this.emailForm.value);
    } else {
      this.emailForm.markAllAsTouched();
    }
  }
}
