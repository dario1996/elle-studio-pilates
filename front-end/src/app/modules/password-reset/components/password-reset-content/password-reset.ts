import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'password-reset.html',
  styleUrls: ['password-reset.css']
})
export class PasswordResetComponent {
  @Output() submitRequest = new EventEmitter<string>();
  @Output() success = new EventEmitter<void>();

  email = '';
  isLoading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  get isValid(): boolean {
    return this.email.length > 0 && this.email.includes('@');
  }

  resetForm() {
    this.email = '';
    this.showSuccess = false;
    this.showError = false;
    this.errorMessage = '';
  }

  handleSubmit() {
    if (!this.isValid) {
      this.showError = true;
      this.errorMessage = 'Inserisci un\'email valida';
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.submitRequest.emit(this.email);
  }

  handleSuccess() {
    this.isLoading = false;
    this.showSuccess = true;
    setTimeout(() => {
      this.success.emit();
    }, 3000);
  }

  handleError(message: string) {
    this.isLoading = false;
    this.showError = true;
    this.errorMessage = message;
  }
}