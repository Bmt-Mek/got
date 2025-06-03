import { createReducer, on } from '@ngrx/store';
import { Character } from '../../models';
import * as FavoritesActions from './favorites.actions';

export interface FavoritesState {
  favorites: Character[];
  loading: boolean;
  error: string | null;
}

export const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null
};

export const favoritesReducer = createReducer(
  initialState,
  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    loading: false,
    error: null
  })),
  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FavoritesActions.addToFavorites, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.addToFavoritesSuccess, (state, { character }) => ({
    ...state,
    favorites: [...state.favorites, character],
    loading: false,
    error: null
  })),
  on(FavoritesActions.addToFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FavoritesActions.removeFromFavorites, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.removeFromFavoritesSuccess, (state, { characterUrl }) => ({
    ...state,
    favorites: state.favorites.filter(char => char.url !== characterUrl),
    loading: false,
    error: null
  })),
  on(FavoritesActions.removeFromFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FavoritesActions.clearFavorites, (state) => ({
    ...state,
    favorites: [],
    loading: false,
    error: null
  }))
);