import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  loading$ = this.loader.loading$;
  //@Input() isLoadingData = true;

  constructor(public loader: LoadingService) {}
}
