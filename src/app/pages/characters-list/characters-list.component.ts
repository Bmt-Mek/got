import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppState } from '../../store';
import { 
  selectCharacters, 
  selectCharactersLoading, 
  selectCharactersError,
  selectSearchParams,
  selectPaginationInfo
} from '../../store/characters/characters.selectors';
import { selectFavorites, selectIsFavorite } from '../../store/favorites/favorites.selectors';
import { 
  loadCharacters, 
  searchCharacters, 
  setSearchParams, 
  clearSearchParams,
  setCurrentPage 
} from '../../store/characters/characters.actions';
import { addToFavorites, removeFromFavorites } from '../../store/favorites/favorites.actions';

import { Character, CharacterSearchParams } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-characters-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    CharacterCardComponent,
    SearchBarComponent,
    PaginationComponent
  ],
  template: `
    <div class="characters-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1>Game of Thrones Characters</h1>
          <p class="page-description">
            Explore the vast collection of characters from the world of Ice and Fire. 
            Search, filter, and add your favorites to build your personal collection.
          </p>
        </div>

        <!-- Search Bar -->
        <app-search-bar
          [initialSearchParams]="searchParams$ | async"
          (search)="onSearch($event)"
          (advancedSearch)="onAdvancedSearch($event)"
          (clearSearch)="onClearSearch()"
        ></app-search-bar>

        <!-- Loading State -->
        <app-loading-spinner 
          *ngIf="isLoading$ | async" 
          message="Loading characters..."
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

        <!-- Characters Grid -->
        <div *ngIf="!(isLoading$ | async) && !(error$ | async)" class="characters-section">
          <!-- Results Info -->
          <div class="results-info" *ngIf="paginationInfo$ | async as pagination">
            <span *ngIf="pagination.total > 0">
              Showing {{ ((pagination.currentPage - 1) * 10) + 1 }} - 
              {{ Math.min(pagination.currentPage * 10, pagination.total) }} 
              of {{ pagination.total }} characters
            </span>
            <span *ngIf="pagination.total === 0">
              No characters found. Try adjusting your search criteria.
            </span>
          </div>

          <!-- Characters Grid -->
          <div class="characters-grid" *ngIf="characters$ | async as characters">
            <app-character-card
              *ngFor="let character of characters; trackBy: trackByCharacterUrl"
              [character]="character"
              [isFavorite]="(isCharacterFavorite(character.url) | async) || false"
              (toggleFavorite)="onToggleFavorite($event)"
              (cardClick)="onCharacterClick($event)"
              class="character-card-wrapper"
            ></app-character-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="(characters$ | async)?.length === 0" class="empty-state">
            <mat-icon>person_search</mat-icon>
            <h3>No characters found</h3>
            <p>Try adjusting your search filters or browse all characters.</p>
            <button mat-raised-button color="primary" (click)="onClearSearch()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>

          <!-- Pagination -->
          <app-pagination
            *ngIf="paginationInfo$ | async as pagination"
            [currentPage]="pagination.currentPage"
            [totalPages]="pagination.totalPages"
            [total]="pagination.total"
            (pageChange)="onPageChange($event)"
          ></app-pagination>
        </div>
      </div>

      <!-- Floating Action Button -->
      <button 
        mat-fab 
        color="accent" 
        class="favorites-fab"
        (click)="onGoToFavorites()"
        [matBadge]="(favoriteCount$ | async) || 0"
        [matBadgeHidden]="((favoriteCount$ | async) || 0) === 0"
        matBadgeColor="warn"
        matTooltip="View Favorites"
      >
        <mat-icon>favorite</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .characters-page {
      min-height: 100vh;
      padding: 2rem 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }

    .page-description {
      font-size: 1.1rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .characters-section {
      margin-top: 2rem;
    }

    .results-info {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      text-align: center;
      font-size: 0.875rem;
      color: #666;
    }

    .characters-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .characters-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .characters-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1200px) {
      .characters-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .character-card-wrapper {
      height: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .empty-state p {
      margin-bottom: 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
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

    .favorites-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    @media (max-width: 480px) {
      .favorites-fab {
        bottom: 80px; /* Account for mobile bottom navigation */
      }
    }
  `]
})
export class CharactersListComponent implements OnInit, OnDestroy {
  characters$: Observable<Character[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  searchParams$: Observable<CharacterSearchParams | null>;
  paginationInfo$: Observable<any>;
  favoriteCount$: Observable<number>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.characters$ = this.store.select(selectCharacters);
    this.isLoading$ = this.store.select(selectCharactersLoading);
    this.error$ = this.store.select(selectCharactersError);
    this.searchParams$ = this.store.select(selectSearchParams);
    this.paginationInfo$ = this.store.select(selectPaginationInfo);
    
    this.favoriteCount$ = this.store.select(selectFavorites).pipe(
      map(favorites => favorites.length)
    );
  }

  ngOnInit(): void {
    // Load initial characters
    this.store.dispatch(loadCharacters({}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      this.store.dispatch(searchCharacters({ searchTerm: searchTerm.trim() }));
    } else {
      this.store.dispatch(clearSearchParams());
      this.store.dispatch(loadCharacters({}));
    }
  }

  onAdvancedSearch(searchParams: CharacterSearchParams): void {
    this.store.dispatch(setSearchParams({ searchParams }));
    this.store.dispatch(loadCharacters({ searchParams }));
  }

  onClearSearch(): void {
    this.store.dispatch(clearSearchParams());
    this.store.dispatch(loadCharacters({}));
  }

  onPageChange(page: number): void {
    this.store.dispatch(setCurrentPage({ page }));
    
    // Get current search params and load characters for the new page
    this.searchParams$.pipe(takeUntil(this.destroy$)).subscribe(searchParams => {
      this.store.dispatch(loadCharacters({ page, searchParams: searchParams || undefined }));
    });
  }

  onToggleFavorite(character: Character): void {
    // Prevent multiple rapid clicks
    if (!character || !character.url) {
      return;
    }

    this.isCharacterFavorite(character.url).pipe(take(1)).subscribe({
      next: (isFavorite) => {
        try {
          if (isFavorite) {
            this.store.dispatch(removeFromFavorites({ characterUrl: character.url }));
            this.snackBar.open('Removed from favorites', 'Close', { duration: 2000 });
          } else {
            this.store.dispatch(addToFavorites({ character }));
            this.snackBar.open('Added to favorites', 'Close', { duration: 2000 });
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          this.snackBar.open('Error updating favorites', 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
        this.snackBar.open('Error updating favorites', 'Close', { duration: 2000 });
      }
    });
  }

  onCharacterClick(character: Character): void {
    const characterId = this.extractCharacterIdFromUrl(character.url);
    this.router.navigate(['/characters', characterId]);
  }

  onGoToFavorites(): void {
    this.router.navigate(['/favorites']);
  }

  onRetry(): void {
    this.searchParams$.pipe(takeUntil(this.destroy$)).subscribe(searchParams => {
      this.store.dispatch(loadCharacters({ searchParams: searchParams || undefined }));
    });
  }

  isCharacterFavorite(characterUrl: string): Observable<boolean> {
    return this.store.select(selectIsFavorite(characterUrl));
  }

  trackByCharacterUrl(index: number, character: Character): string {
    return character.url;
  }

  private extractCharacterIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }

  // Expose Math for template
  Math = Math;
}