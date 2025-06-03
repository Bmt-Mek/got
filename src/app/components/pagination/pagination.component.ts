import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="pagination-container" *ngIf="totalPages > 1">
      <div class="pagination-info">
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <span class="total-info">
          ({{ total }} total characters)
        </span>
      </div>

      <div class="pagination-controls">
        <!-- First page -->
        <button 
          mat-icon-button 
          [disabled]="currentPage <= 1"
          (click)="onPageChange(1)"
          matTooltip="First page"
          class="hidden-mobile"
        >
          <mat-icon>first_page</mat-icon>
        </button>

        <!-- Previous page -->
        <button 
          mat-icon-button 
          [disabled]="currentPage <= 1"
          (click)="onPageChange(currentPage - 1)"
          matTooltip="Previous page"
        >
          <mat-icon>chevron_left</mat-icon>
        </button>

        <!-- Page numbers -->
        <div class="page-numbers hidden-mobile">
          <button
            *ngFor="let page of visiblePages"
            mat-button
            [class.current-page]="page === currentPage"
            [class.ellipsis]="page === -1"
            [disabled]="page === -1"
            (click)="onPageChange(page)"
          >
            {{ page === -1 ? '...' : page }}
          </button>
        </div>

        <!-- Mobile page selector -->
        <div class="mobile-page-selector hidden-desktop">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Page</mat-label>
            <mat-select 
              [value]="currentPage" 
              (selectionChange)="onPageChange($event.value)"
            >
              <mat-option *ngFor="let page of allPages" [value]="page">
                {{ page }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Next page -->
        <button 
          mat-icon-button 
          [disabled]="currentPage >= totalPages"
          (click)="onPageChange(currentPage + 1)"
          matTooltip="Next page"
        >
          <mat-icon>chevron_right</mat-icon>
        </button>

        <!-- Last page -->
        <button 
          mat-icon-button 
          [disabled]="currentPage >= totalPages"
          (click)="onPageChange(totalPages)"
          matTooltip="Last page"
          class="hidden-mobile"
        >
          <mat-icon>last_page</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      margin-top: 2rem;
    }

    @media (min-width: 768px) {
      .pagination-container {
        flex-direction: row;
        justify-content: space-between;
      }
    }

    .pagination-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }

    @media (min-width: 768px) {
      .pagination-info {
        align-items: flex-start;
      }
    }

    .page-info {
      font-weight: 500;
    }

    .total-info {
      font-size: 0.75rem;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0 0.5rem;
    }

    .page-numbers button {
      min-width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .page-numbers button.current-page {
      background-color: #1976d2;
      color: white;
    }

    .page-numbers button.ellipsis {
      cursor: default;
      color: #666;
    }

    .mobile-page-selector {
      margin: 0 0.5rem;
    }

    .mobile-page-selector mat-form-field {
      width: 80px;
    }

    :host ::ng-deep .mobile-page-selector .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    @media (max-width: 768px) {
      .hidden-mobile {
        display: none;
      }
    }

    @media (min-width: 769px) {
      .hidden-desktop {
        display: none;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  get visiblePages(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (let i = Math.max(2, this.currentPage - delta);
         i <= Math.min(this.totalPages - 1, this.currentPage + delta);
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots.filter((page, index, arr) => 
      page === -1 || arr.indexOf(page) === index
    );
  }

  get allPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}