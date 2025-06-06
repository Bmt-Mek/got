import { ActionReducerMap } from '@ngrx/store';
import {
  charactersReducer,
  CharactersState,
} from './characters/characters.reducer';
import {
  favoritesReducer,
  FavoritesState,
} from './favorites/favorites.reducer';
import { authReducer, AuthState } from './auth/auth.reducer';

export interface AppState {
  characters: CharactersState;
  favorites: FavoritesState;
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  characters: charactersReducer,
  favorites: favoritesReducer,
  auth: authReducer,
};

// Characters exports
export {
  charactersReducer,
  CharactersState,
  initialState as charactersInitialState,
} from './characters/characters.reducer';
export * from './characters/characters.actions';
export * from './characters/characters.selectors';
export * from './characters/characters.effects';

// Favorites exports
export {
  favoritesReducer,
  FavoritesState,
  initialState as favoritesInitialState,
} from './favorites/favorites.reducer';
export * from './favorites/favorites.actions';
export * from './favorites/favorites.selectors';
export * from './favorites/favorites.effects';

// Auth exports
export {
  authReducer,
  AuthState,
  initialState as authInitialState,
} from './auth/auth.reducer';
export * from './auth/auth.actions';
export * from './auth/auth.selectors';
export * from './auth/auth.effects';
