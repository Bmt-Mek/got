import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { FavoritesService } from '../../services/favorites.service';
import * as FavoritesActions from './favorites.actions';

@Injectable()
export class FavoritesEffects {
  constructor(
    private actions$: Actions,
    private favoritesService: FavoritesService
  ) {}

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      switchMap(() =>
        this.favoritesService.getFavorites().pipe(
          map(favorites =>
            FavoritesActions.loadFavoritesSuccess({ favorites })
          ),
          catchError((error: { message: string }) =>
            of(
              FavoritesActions.loadFavoritesFailure({
                error: error.message || 'Failed to load favorites',
              })
            )
          )
        )
      )
    )
  );

  addToFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addToFavorites),
      tap(action => console.log('AddToFavorites effect triggered:', action)),
      switchMap(({ character }) =>
        this.favoritesService.addToFavorites(character).pipe(
          tap(() =>
            console.log('Add to favorites service completed successfully')
          ),
          map(() => {
            console.log('Dispatching addToFavoritesSuccess');
            return FavoritesActions.addToFavoritesSuccess({ character });
          }),
          catchError((error: { message: string }) => {
            console.error('Add to favorites service error:', error);
            return of(
              FavoritesActions.addToFavoritesFailure({
                error: error.message || 'Failed to add to favorites',
              })
            );
          })
        )
      )
    )
  );

  removeFromFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFromFavorites),
      switchMap(({ characterUrl }) =>
        this.favoritesService.removeFromFavorites(characterUrl).pipe(
          map(() =>
            FavoritesActions.removeFromFavoritesSuccess({ characterUrl })
          ),
          catchError((error: { message: string }) =>
            of(
              FavoritesActions.removeFromFavoritesFailure({
                error: error.message || 'Failed to remove from favorites',
              })
            )
          )
        )
      )
    )
  );
}
