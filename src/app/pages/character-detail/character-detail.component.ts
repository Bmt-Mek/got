import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap, filter, take, debounceTime, startWith, catchError } from 'rxjs/operators';
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
  selectCharactersError 
} from '../../store/characters/characters.selectors';
import { selectIsFavorite } from '../../store/favorites/favorites.selectors';
import { loadCharacterById } from '../../store/characters/characters.actions';
import { addToFavorites, removeFromFavorites } from '../../store/favorites/favorites.actions';

import { Character } from '../../models';
import { CharactersService } from '../../services';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="character-detail-page">
      <div class="container">
        <!-- Loading State -->
        <app-loading-spinner 
          *ngIf="isLoading$ | async" 
          message="Loading character details..."
        ></app-loading-spinner>

        <!-- Error State -->
        <div *ngIf="error$ | async as error" class="error-message">
          <mat-icon>error</mat-icon>
          <h3>Character not found</h3>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to Characters
            </button>
            <button mat-button (click)="onRetry()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        </div>

        <!-- Character Details -->
        <div *ngIf="character$ | async as character" class="character-content fade-in">
          <!-- Navigation -->
          <div class="character-nav">
            <button mat-button (click)="goBack()" class="back-button">
              <mat-icon>arrow_back</mat-icon>
              Back to Characters
            </button>
            
            <button 
              mat-fab 
              [color]="(isFavorite$ | async) ? 'warn' : 'primary'"
              (click)="onToggleFavorite(character)"
              [matTooltip]="(isFavorite$ | async) ? 'Remove from favorites' : 'Add to favorites'"
              class="favorite-fab"
            >
              <mat-icon>{{ (isFavorite$ | async) ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
          </div>

          <!-- Character Header -->
          <mat-card class="character-header">
            <mat-card-header>
              <div mat-card-avatar class="character-avatar">
                <mat-icon [class.alive]="isAlive(character)" [class.dead]="!isAlive(character)">
                  {{ isAlive(character) ? 'person' : 'person_off' }}
                </mat-icon>
              </div>
              <mat-card-title>{{ getDisplayName(character) }}</mat-card-title>
              <mat-card-subtitle *ngIf="character.culture">{{ character.culture }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="status-chips">
                <mat-chip-set>
                  <mat-chip [class.alive-chip]="isAlive(character)" [class.dead-chip]="!isAlive(character)">
                    {{ isAlive(character) ? 'Alive' : 'Deceased' }}
                  </mat-chip>
                  <mat-chip *ngIf="character.gender" class="gender-chip">
                    {{ character.gender }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Character Information Grid -->
          <div class="character-info-grid">
            <!-- Basic Information -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>info</mat-icon>
                  Basic Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-item" *ngIf="character.born">
                  <span class="info-label">Born:</span>
                  <span class="info-value">{{ character.born }}</span>
                </div>
                <div class="info-item" *ngIf="character.died">
                  <span class="info-label">Died:</span>
                  <span class="info-value">{{ character.died }}</span>
                </div>
                <div class="info-item" *ngIf="character.culture">
                  <span class="info-label">Culture:</span>
                  <span class="info-value">{{ character.culture }}</span>
                </div>
                <div class="info-item" *ngIf="character.gender">
                  <span class="info-label">Gender:</span>
                  <span class="info-value">{{ character.gender }}</span>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Titles -->
            <mat-card class="info-card" *ngIf="character.titles?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>military_tech</mat-icon>
                  Titles
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip 
                    *ngFor="let title of getValidItems(character.titles); trackBy: trackByTitle"
                    class="title-chip"
                    [matTooltip]="title"
                  >
                    {{ title }}
                  </mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>

            <!-- Aliases -->
            <mat-card class="info-card" *ngIf="character.aliases?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>face</mat-icon>
                  Also Known As
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip 
                    *ngFor="let alias of getValidItems(character.aliases); trackBy: trackByAlias"
                    class="alias-chip"
                    [matTooltip]="alias"
                  >
                    {{ alias }}
                  </mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>

            <!-- Family -->
            <mat-card class="info-card" *ngIf="hasFamilyInfo(character)">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>family_restroom</mat-icon>
                  Family
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-item" *ngIf="character.father">
                  <span class="info-label">Father:</span>
                  <span class="info-value">{{ getCharacterNameFromUrl(character.father) }}</span>
                </div>
                <div class="info-item" *ngIf="character.mother">
                  <span class="info-label">Mother:</span>
                  <span class="info-value">{{ getCharacterNameFromUrl(character.mother) }}</span>
                </div>
                <div class="info-item" *ngIf="character.spouse">
                  <span class="info-label">Spouse:</span>
                  <span class="info-value">{{ getCharacterNameFromUrl(character.spouse) }}</span>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Allegiances -->
            <mat-card class="info-card" *ngIf="character.allegiances?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>shield</mat-icon>
                  Allegiances
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="allegiances-list">
                  <mat-chip-set>
                    <mat-chip 
                      *ngFor="let allegiance of character.allegiances.slice(0, 5); trackBy: trackByAllegiance"
                      class="allegiance-chip"
                    >
                      {{ getHouseNameFromUrl(allegiance) }}
                    </mat-chip>
                  </mat-chip-set>
                  <p *ngIf="character.allegiances.length > 5" class="more-items">
                    +{{ character.allegiances.length - 5 }} more
                  </p>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- TV Series -->
            <mat-card class="info-card" *ngIf="character.tvSeries?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>tv</mat-icon>
                  TV Series Appearances
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip 
                    *ngFor="let season of getValidItems(character.tvSeries); trackBy: trackBySeason"
                    class="tv-chip"
                  >
                    {{ season }}
                  </mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>

            <!-- Played By -->
            <mat-card class="info-card" *ngIf="character.playedBy?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Played By
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip 
                    *ngFor="let actor of getValidItems(character.playedBy); trackBy: trackByActor"
                    class="actor-chip"
                  >
                    {{ actor }}
                  </mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>

            <!-- Books -->
            <mat-card class="info-card" *ngIf="character.books?.length || character.povBooks?.length">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>book</mat-icon>
                  Book Appearances
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="character.povBooks?.length" class="book-section">
                  <h4>POV Character in:</h4>
                  <mat-chip-set>
                    <mat-chip 
                      *ngFor="let book of character.povBooks.slice(0, 3); trackBy: trackByBook"
                      class="pov-book-chip"
                    >
                      {{ getBookNameFromUrl(book) }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
                <div *ngIf="character.books?.length" class="book-section">
                  <h4>Appears in:</h4>
                  <mat-chip-set>
                    <mat-chip 
                      *ngFor="let book of character.books.slice(0, 3); trackBy: trackByBook"
                      class="book-chip"
                    >
                      {{ getBookNameFromUrl(book) }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .character-detail-page {
      min-height: 100vh;
      padding: 2rem 0;
    }

    .character-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .character-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .favorite-fab {
      position: fixed;
      top: 50%;
      right: 20px;
      z-index: 1000;
      transform: translateY(-50%);
    }

    @media (max-width: 768px) {
      .favorite-fab {
        position: static;
        transform: none;
      }
    }

    .character-header {
      margin-bottom: 2rem;
    }

    .character-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #f5f5f5;
    }

    .character-avatar mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .character-avatar mat-icon.alive {
      color: #4caf50;
    }

    .character-avatar mat-icon.dead {
      color: #f44336;
    }

    .status-chips {
      margin-top: 1rem;
    }

    .alive-chip {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .dead-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .gender-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .character-info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .character-info-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .character-info-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .info-card {
      height: fit-content;
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .info-label {
      font-weight: 500;
      color: #666;
    }

    .info-value {
      text-align: right;
      flex: 1;
      margin-left: 1rem;
    }

    .title-chip {
      background-color: #fff3e0 !important;
      color: #ef6c00 !important;
      margin-bottom: 0.5rem;
    }

    .alias-chip {
      background-color: #f3e5f5 !important;
      color: #7b1fa2 !important;
      margin-bottom: 0.5rem;
    }

    .allegiance-chip {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
      margin-bottom: 0.5rem;
    }

    .tv-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
      margin-bottom: 0.5rem;
    }

    .actor-chip {
      background-color: #fce4ec !important;
      color: #c2185b !important;
      margin-bottom: 0.5rem;
    }

    .book-section {
      margin-bottom: 1rem;
    }

    .book-section:last-child {
      margin-bottom: 0;
    }

    .book-section h4 {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #666;
    }

    .pov-book-chip {
      background-color: #fff8e1 !important;
      color: #f57c00 !important;
      margin-bottom: 0.5rem;
    }

    .book-chip {
      background-color: #f1f8e9 !important;
      color: #558b2f !important;
      margin-bottom: 0.5rem;
    }

    .more-items {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.5rem;
      margin-bottom: 0;
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

    .error-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `]
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
      switchMap(character => this.store.select(selectIsFavorite(character!.url)))
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.characterId = params['id'];
      if (this.characterId) {
        this.store.dispatch(loadCharacterById({ id: this.characterId }));
      }
    });

    // Set up debounced favorite toggle
    this.favoriteToggle$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(character => {
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
    this.store.select(selectIsFavorite(character.url)).pipe(take(1)).subscribe({
      next: (isFavorite) => {
        console.log('Current favorite status:', isFavorite);
        try {
          if (isFavorite) {
            console.log('Removing from favorites');
            this.store.dispatch(removeFromFavorites({ characterUrl: character.url }));
            this.snackBar.open('Removed from favorites', 'Close', { duration: 2000 });
          } else {
            console.log('Adding to favorites');
            this.store.dispatch(addToFavorites({ character }));
            this.snackBar.open('Added to favorites', 'Close', { duration: 2000 });
          }
        } catch (error) {
          console.error('Error dispatching action:', error);
          this.snackBar.open('Error updating favorites', 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
        this.snackBar.open('Error updating favorites', 'Close', { duration: 2000 });
      }
    });
  }

  onRetry(): void {
    if (this.characterId) {
      this.store.dispatch(loadCharacterById({ id: this.characterId }));
    }
  }

  goBack(): void {
    this.router.navigate(['/characters']);
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
      '5': 'A Dance with Dragons'
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