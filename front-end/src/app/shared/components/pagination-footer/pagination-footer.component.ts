import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-footer.component.html',
  styleUrls: ['./pagination-footer.component.css']
})
export class PaginationFooterComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pages: number[] = [];
  @Input() displayedItems = 0;
  @Input() totalItems = 0;
  @Input() pageSize = 20;
  @Input() entityName = 'elementi';

  @Output() pageChange = new EventEmitter<number>();

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}