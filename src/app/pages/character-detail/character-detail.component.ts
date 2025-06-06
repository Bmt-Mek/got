import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  takeUntil,
  switchMap,
  filter,
  take,
  debounceTime,
} from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppState } from '../../store';
import {
  selectSelectedCharacter,
  selectCharactersLoading,
  selectCharactersError,
} from '../../store/characters/characters.selectors';
import { selectIsFavorite } from '../../store/favorites/favorites.selectors';
import { loadCharacterById } from '../../store/characters/characters.actions';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../store/favorites/favorites.actions';

import { Character } from '../../models';
import { CharactersService } from '../../services';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-character-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss'],
})
export class CharacterDetailComponent implements OnInit, OnDestroy {
  character$: Observable<Character | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  isFavorite$: Observable<boolean>;

  private destroy$ = new Subject<void>();
  private characterId: string = '';
  private favoriteToggle$ = new Subject<Character>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private charactersService: CharactersService
  ) {
    this.character$ = this.store.select(selectSelectedCharacter);
    this.isLoading$ = this.store.select(selectCharactersLoading);
    this.error$ = this.store.select(selectCharactersError);
    this.isFavorite$ = this.character$.pipe(
      filter(character => !!character),
      switchMap(character => this.store.select(selectIsFavorite(character.url)))
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.characterId = params['id'] as string;
      if (this.characterId) {
        this.store.dispatch(loadCharacterById({ id: this.characterId }));
      }
    });

    // Set up debounced favorite toggle
    this.favoriteToggle$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(character => {
        this.performFavoriteToggle(character);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleFavorite(character: Character): void {
    // Prevent multiple rapid clicks
    if (!character || !character.url) {
      return;
    }

    this.favoriteToggle$.next(character);
  }

  private performFavoriteToggle(character: Character): void {
    console.log('performFavoriteToggle called with character:', character);

    if (!character || !character.url) {
      console.error('Invalid character data:', character);
      this.snackBar.open('Invalid character data', 'Close', { duration: 2000 });
      return;
    }

    console.log('Checking favorite status for URL:', character.url);

    // Directly check the favorite status using the character URL instead of relying on the complex observable chain
    this.store
      .select(selectIsFavorite(character.url))
      .pipe(take(1))
      .subscribe({
        next: isFavorite => {
          console.log('Current favorite status:', isFavorite);
          try {
            if (isFavorite) {
              console.log('Removing from favorites');
              this.store.dispatch(
                removeFromFavorites({ characterUrl: character.url })
              );
              this.snackBar.open('Removed from favorites', 'Close', {
                duration: 2000,
              });
            } else {
              console.log('Adding to favorites');
              this.store.dispatch(addToFavorites({ character }));
              this.snackBar.open('Added to favorites', 'Close', {
                duration: 2000,
              });
            }
          } catch (error) {
            console.error('Error dispatching action:', error);
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

  onRetry(): void {
    if (this.characterId) {
      this.store.dispatch(loadCharacterById({ id: this.characterId }));
    }
  }

  goBack(): void {
    void this.router.navigate(['/characters']);
  }

  getDisplayName(character: Character): string {
    return this.charactersService.getCharacterDisplayName(character);
  }

  isAlive(character: Character): boolean {
    return this.charactersService.isCharacterAlive(character);
  }

  getValidItems(items: string[] | undefined): string[] {
    if (!items) return [];
    return items.filter(item => item && item.trim() !== '');
  }

  hasFamilyInfo(character: Character): boolean {
    return !!(character.father || character.mother || character.spouse);
  }

  getCharacterNameFromUrl(url: string): string {
    // This would ideally fetch the character name from the API
    // For now, just return a placeholder
    const id = url.split('/').pop();
    return `Character ${id}`;
  }

  getHouseNameFromUrl(url: string): string {
    // This would ideally fetch the house name from the API
    // For now, just return a placeholder
    const id = url.split('/').pop();
    return `House ${id}`;
  }

  getBookNameFromUrl(url: string): string {
    // Map common book URLs to names
    const bookNames: { [key: string]: string } = {
      '1': 'A Game of Thrones',
      '2': 'A Clash of Kings',
      '3': 'A Storm of Swords',
      '4': 'A Feast for Crows',
      '5': 'A Dance with Dragons',
    };

    const id = url.split('/').pop() || '';
    return bookNames[id] || `Book ${id}`;
  }

  trackByTitle(index: number, title: string): string {
    return title;
  }

  trackByAlias(index: number, alias: string): string {
    return alias;
  }

  trackByAllegiance(index: number, allegiance: string): string {
    return allegiance;
  }

  trackBySeason(index: number, season: string): string {
    return season;
  }

  trackByActor(index: number, actor: string): string {
    return actor;
  }

  trackByBook(index: number, book: string): string {
    return book;
  }
}
