import { CommonModule } from '@angular/common';
import { ImgFallbackDirective } from './directives/img-fallback.directive';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Import the DataTable component
import { ToastUniversaleService } from './services/toast-universale.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ImgFallbackDirective,
    FormsModule,
  ],
  exports: [
    ImgFallbackDirective,
    FormsModule,
  ],
  providers: [
    ToastUniversaleService
  ]
})
export class SharedModule {}
