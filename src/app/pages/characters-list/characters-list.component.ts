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
  selectPaginationInfo,
} from '../../store/characters/characters.selectors';
import {
  selectFavorites,
  selectIsFavorite,
} from '../../store/favorites/favorites.selectors';
import {
  loadCharacters,
  searchCharacters,
  setSearchParams,
  clearSearchParams,
  setCurrentPage,
} from '../../store/characters/characters.actions';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../store/favorites/favorites.actions';

import { Character, CharacterSearchParams } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
    selector: 'app-characters-list',
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
        PaginationComponent,
    ],
    templateUrl: './characters-list.component.html',
    styleUrls: ['./characters-list.component.scss']
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

    this.favoriteCount$ = this.store
      .select(selectFavorites)
      .pipe(map(favorites => favorites.length));
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
    this.searchParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(searchParams => {
        this.store.dispatch(
          loadCharacters({ page, searchParams: searchParams || undefined })
        );
      });
  }

  onToggleFavorite(character: Character): void {
    // Prevent multiple rapid clicks
    if (!character || !character.url) {
      return;
    }

    this.isCharacterFavorite(character.url)
      .pipe(take(1))
      .subscribe({
        next: isFavorite => {
          try {
            if (isFavorite) {
              this.store.dispatch(
                removeFromFavorites({ characterUrl: character.url })
              );
              this.snackBar.open('Removed from favorites', 'Close', {
                duration: 2000,
              });
            } else {
              this.store.dispatch(addToFavorites({ character }));
              this.snackBar.open('Added to favorites', 'Close', {
                duration: 2000,
              });
            }
          } catch (error) {
            console.error('Error toggling favorite:', error);
            this.snackBar.open('Error updating favorites', 'Close', {
              duration: 2000,
            });
          }
        },
        error: error => {
          console.error('Error checking favorite status:', error);
          this.snackBar.open('Error updating favorites', 'Close', {
            duration: 2000,
          });
        },
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
    this.searchParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(searchParams => {
        this.store.dispatch(
          loadCharacters({ searchParams: searchParams || undefined })
        );
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
