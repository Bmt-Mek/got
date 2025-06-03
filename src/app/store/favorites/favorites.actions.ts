import { createAction, props } from '@ngrx/store';
import { Character } from '../../models';

export const loadFavorites = createAction(
  '[Favorites] Load Favorites'
);

export const loadFavoritesSuccess = createAction(
  '[Favorites] Load Favorites Success',
  props<{ favorites: Character[] }>()
);

export const loadFavoritesFailure = createAction(
  '[Favorites] Load Favorites Failure',
  props<{ error: string }>()
);

export const addToFavorites = createAction(
  '[Favorites] Add To Favorites',
  props<{ character: Character }>()
);

export const addToFavoritesSuccess = createAction(
  '[Favorites] Add To Favorites Success',
  props<{ character: Character }>()
);

export const addToFavoritesFailure = createAction(
  '[Favorites] Add To Favorites Failure',
  props<{ error: string }>()
);

export const removeFromFavorites = createAction(
  '[Favorites] Remove From Favorites',
  props<{ characterUrl: string }>()
);

export const removeFromFavoritesSuccess = createAction(
  '[Favorites] Remove From Favorites Success',
  props<{ characterUrl: string }>()
);

export const removeFromFavoritesFailure = createAction(
  '[Favorites] Remove From Favorites Failure',
  props<{ error: string }>()
);

export const clearFavorites = createAction(
  '[Favorites] Clear Favorites'
);