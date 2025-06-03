import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="loading-content">
        <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      width: 100%;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      min-height: 100vh;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-message {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
  @Input() diameter: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}