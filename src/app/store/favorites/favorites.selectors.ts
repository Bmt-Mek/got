import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

export const selectFavorites = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.favorites
);

export const selectFavoritesLoading = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.loading
);

export const selectFavoritesError = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.error
);

export const selectFavoritesCount = createSelector(
  selectFavorites,
  (favorites) => favorites.length
);

export const selectIsFavorite = (characterUrl: string) => createSelector(
  selectFavorites,
  (favorites) => favorites.some(char => char.url === characterUrl)
);