import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { AppState } from '../../store';
import { 
  selectFavorites, 
  selectFavoritesLoading, 
  selectFavoritesError 
} from '../../store/favorites/favorites.selectors';
import { 
  loadFavorites, 
  removeFromFavorites, 
  clearFavorites 
} from '../../store/favorites/favorites.actions';

import { Character } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    LoadingSpinnerComponent,
    CharacterCardComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="favorites-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-text">
              <h1>My Favorites</h1>
              <p class="page-description">
                Your personal collection of favorite Game of Thrones characters.
              </p>
            </div>
            <div class="header-actions" *ngIf="(favorites$ | async)?.length">
              <button 
                mat-button 
                color="warn"
                (click)="onClearAllFavorites()"
                class="clear-button"
              >
                <mat-icon>clear_all</mat-icon>
                Clear All
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <app-loading-spinner 
          *ngIf="isLoading$ | async" 
          message="Loading your favorites..."
        ></app-loading-spinner>

        <!-- Error State -->
        <div *ngIf="error$ | async as error" class="error-message">
          <mat-icon>error</mat-icon>
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="onRetry()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>

        <!-- Favorites Content -->
        <div *ngIf="!(isLoading$ | async) && !(error$ | async)" class="favorites-content">
          <!-- Favorites Count -->
          <div class="favorites-count" *ngIf="(favorites$ | async)?.length">
            <mat-card class="count-card">
              <mat-card-content>
                <div class="count-display">
                  <mat-icon>favorite</mat-icon>
                  <span class="count-number">{{ (favorites$ | async)?.length }}</span>
                  <span class="count-label">
                    {{ (favorites$ | async)?.length === 1 ? 'favorite character' : 'favorite characters' }}
                  </span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Favorites Grid -->
          <div class="favorites-grid" *ngIf="favorites$ | async as favorites">
            <app-character-card
              *ngFor="let character of favorites; trackBy: trackByCharacterUrl"
              [character]="character"
              [isFavorite]="true"
              (toggleFavorite)="onRemoveFromFavorites($event)"
              (cardClick)="onCharacterClick($event)"
              class="favorite-card-wrapper"
            ></app-character-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="(favorites$ | async)?.length === 0" class="empty-state">
            <div class="empty-content">
              <mat-icon class="empty-icon">favorite_border</mat-icon>
              <h3>No favorites yet</h3>
              <p>
                Start building your collection by exploring characters and adding them to your favorites.
              </p>
              <div class="empty-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="onGoToCharacters()"
                  class="explore-button"
                >
                  <mat-icon>explore</mat-icon>
                  Explore Characters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" *ngIf="(favorites$ | async)?.length">
          <mat-card class="actions-card">
            <mat-card-content>
              <h3>Quick Actions</h3>
              <div class="action-buttons">
                <button 
                  mat-stroked-button 
                  color="primary" 
                  (click)="onExportFavorites()"
                >
                  <mat-icon>download</mat-icon>
                  Export List
                </button>
                <button 
                  mat-stroked-button 
                  color="primary" 
                  (click)="onShareFavorites()"
                >
                  <mat-icon>share</mat-icon>
                  Share Collection
                </button>
                <button 
                  mat-stroked-button 
                  color="accent" 
                  (click)="onGoToCharacters()"
                >
                  <mat-icon>add</mat-icon>
                  Add More
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .favorites-page {
      min-height: 100vh;
      padding: 2rem 0;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .header-text h1 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }

    .page-description {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .clear-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .favorites-content {
      margin-top: 2rem;
    }

    .favorites-count {
      margin-bottom: 2rem;
    }

    .count-card {
      max-width: 400px;
      margin: 0 auto;
    }

    .count-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-align: center;
    }

    .count-display mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #e91e63;
    }

    .count-number {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .count-label {
      font-size: 1rem;
      color: #666;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .favorites-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .favorites-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1200px) {
      .favorites-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .favorite-card-wrapper {
      height: 100%;
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 2rem;
    }

    .empty-content {
      text-align: center;
      max-width: 400px;
    }

    .empty-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-content h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #666;
    }

    .empty-content p {
      margin-bottom: 2rem;
      color: #666;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
    }

    .explore-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
    }

    .quick-actions {
      margin-top: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .actions-card h3 {
      margin-bottom: 1rem;
      text-align: center;
      color: #333;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 768px) {
      .action-buttons {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
    }

    .error-message {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .error-message mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: #f44336;
    }

    .error-message h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #f44336;
    }

    .error-message p {
      margin-bottom: 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites$: Observable<Character[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.favorites$ = this.store.select(selectFavorites);
    this.isLoading$ = this.store.select(selectFavoritesLoading);
    this.error$ = this.store.select(selectFavoritesError);
  }

  ngOnInit(): void {
    // Load favorites on component initialization
    this.store.dispatch(loadFavorites());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRemoveFromFavorites(character: Character): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove from Favorites',
        message: `Are you sure you want to remove "${this.getCharacterDisplayName(character)}" from your favorites?`,
        confirmText: 'Remove',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(removeFromFavorites({ characterUrl: character.url }));
        this.snackBar.open('Character removed from favorites', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  onClearAllFavorites(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Clear All Favorites',
        message: 'Are you sure you want to remove all characters from your favorites? This action cannot be undone.',
        confirmText: 'Clear All',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(clearFavorites());
        this.snackBar.open('All favorites cleared', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  onCharacterClick(character: Character): void {
    const characterId = this.extractCharacterIdFromUrl(character.url);
    this.router.navigate(['/characters', characterId]);
  }

  onGoToCharacters(): void {
    this.router.navigate(['/characters']);
  }

  onRetry(): void {
    this.store.dispatch(loadFavorites());
  }

  onExportFavorites(): void {
    this.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
      if (favorites.length === 0) {
        this.snackBar.open('No favorites to export', 'Close', { duration: 2000 });
        return;
      }

      const exportData = favorites.map(character => ({
        name: this.getCharacterDisplayName(character),
        culture: character.culture,
        gender: character.gender,
        born: character.born,
        died: character.died,
        titles: character.titles,
        aliases: character.aliases
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'got-favorites.json';
      link.click();

      this.snackBar.open('Favorites exported successfully', 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });
  }

  onShareFavorites(): void {
    this.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
      if (favorites.length === 0) {
        this.snackBar.open('No favorites to share', 'Close', { duration: 2000 });
        return;
      }

      const favoriteNames = favorites
        .map(character => this.getCharacterDisplayName(character))
        .join(', ');

      const shareText = `Check out my favorite Game of Thrones characters: ${favoriteNames}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My GoT Favorites',
          text: shareText,
          url: window.location.origin
        }).catch(err => console.log('Error sharing:', err));
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          this.snackBar.open('Favorites list copied to clipboard', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }).catch(() => {
          this.snackBar.open('Could not copy to clipboard', 'Close', { duration: 2000 });
        });
      }
    });
  }

  trackByCharacterUrl(index: number, character: Character): string {
    return character.url;
  }

  private getCharacterDisplayName(character: Character): string {
    if (character.name && character.name.trim()) {
      return character.name;
    }
    
    if (character.aliases && character.aliases.length > 0) {
      const validAlias = character.aliases.find(alias => alias && alias.trim());
      if (validAlias) {
        return validAlias;
      }
    }
    
    return 'Unknown Character';
  }

  private extractCharacterIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }
}