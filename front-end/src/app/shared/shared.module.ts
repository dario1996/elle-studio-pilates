import { CommonModule } from '@angular/common';
import { ImgFallbackDirective } from './directives/img-fallback.directive';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Import the DataTable component
import { DataTableComponent } from './components/data-table/data-table.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ImgFallbackDirective,
    FormsModule,
    DataTableComponent, // Import the standalone component
  ],
  exports: [
    ImgFallbackDirective,
    DataTableComponent, // Export for use in other modules
  ],
})
export class SharedModule {}
