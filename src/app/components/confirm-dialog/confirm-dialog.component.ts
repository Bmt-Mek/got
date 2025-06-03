import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
        {{ data.title }}
      </h2>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button"
        >
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          color="warn" 
          (click)="onConfirm()"
          class="confirm-button"
        >
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 300px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .dialog-icon {
      color: #f44336;
    }

    mat-dialog-content {
      margin-bottom: 1rem;
    }

    mat-dialog-content p {
      margin: 0;
      line-height: 1.6;
      color: #666;
    }

    mat-dialog-actions {
      gap: 0.5rem;
    }

    .cancel-button,
    .confirm-button {
      min-width: 80px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}