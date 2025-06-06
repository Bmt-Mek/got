import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CharactersState } from './characters.reducer';

export const selectCharactersState =
  createFeatureSelector<CharactersState>('characters');

export const selectCharacters = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.characters
);

export const selectSelectedCharacter = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.selectedCharacter
);

export const selectCharactersLoading = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.loading
);

export const selectCharactersError = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.error
);

export const selectSearchParams = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.searchParams
);

export const selectCurrentPage = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.currentPage
);

export const selectTotalPages = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.totalPages
);

export const selectTotal = createSelector(
  selectCharactersState,
  (state: CharactersState) => state.total
);

export const selectPaginationInfo = createSelector(
  selectCharactersState,
  (state: CharactersState) => ({
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    total: state.total,
    hasNext: state.currentPage < state.totalPages,
    hasPrev: state.currentPage > 1,
  })
);
