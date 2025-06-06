import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { merge, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { AppState } from '../../store';
import {
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from '../../store/favorites/favorites.selectors';
import {
  loadFavorites,
  removeFromFavorites,
  clearFavorites,
} from '../../store/favorites/favorites.actions';

import { Character } from '../../models';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-favorites',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    LoadingSpinnerComponent,
    CharacterCardComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites$: Observable<Character[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  showContent$: Observable<boolean>;

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
    this.showContent$ = merge(this.isLoading$, this.error$).pipe(
      map(res => !!!res)
    );
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
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          removeFromFavorites({ characterUrl: character.url })
        );
        this.snackBar.open('Character removed from favorites', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      }
    });
  }

  onClearAllFavorites(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Clear All Favorites',
        message:
          'Are you sure you want to remove all characters from your favorites? This action cannot be undone.',
        confirmText: 'Clear All',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(clearFavorites());
        this.snackBar.open('All favorites cleared', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      }
    });
  }

  onCharacterClick(character: Character): void {
    const characterId = this.extractCharacterIdFromUrl(character.url);
    void this.router.navigate(['/characters', characterId]);
  }

  onGoToCharacters(): void {
    void this.router.navigate(['/characters']);
  }

  onRetry(): void {
    this.store.dispatch(loadFavorites());
  }

  onExportFavorites(): void {
    this.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
      if (favorites.length === 0) {
        this.snackBar.open('No favorites to export', 'Close', {
          duration: 2000,
        });
        return;
      }

      const exportData = favorites.map(character => ({
        name: this.getCharacterDisplayName(character),
        culture: character.culture,
        gender: character.gender,
        born: character.born,
        died: character.died,
        titles: character.titles,
        aliases: character.aliases,
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'got-favorites.json';
      link.click();

      this.snackBar.open('Favorites exported successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    });
  }

  onShareFavorites(): void {
    this.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
      if (favorites.length === 0) {
        this.snackBar.open('No favorites to share', 'Close', {
          duration: 2000,
        });
        return;
      }

      const favoriteNames = favorites
        .map(character => this.getCharacterDisplayName(character))
        .join(', ');

      const shareText = `Check out my favorite Game of Thrones characters: ${favoriteNames}`;

      if (navigator.share) {
        navigator
          .share({
            title: 'My GoT Favorites',
            text: shareText,
            url: window.location.origin,
          })
          .catch(err => console.log('Error sharing:', err));
      } else {
        // Fallback to clipboard
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            this.snackBar.open('Favorites list copied to clipboard', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          })
          .catch(() => {
            this.snackBar.open('Could not copy to clipboard', 'Close', {
              duration: 2000,
            });
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
