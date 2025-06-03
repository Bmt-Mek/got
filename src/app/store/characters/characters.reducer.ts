import { createReducer, on } from '@ngrx/store';
import { Character, CharacterSearchParams } from '../../models';
import * as CharactersActions from './characters.actions';

export interface CharactersState {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  error: string | null;
  searchParams: CharacterSearchParams | null;
  currentPage: number;
  totalPages: number;
  total: number;
}

export const initialState: CharactersState = {
  characters: [],
  selectedCharacter: null,
  loading: false,
  error: null,
  searchParams: null,
  currentPage: 1,
  totalPages: 0,
  total: 0
};

export const charactersReducer = createReducer(
  initialState,
  on(CharactersActions.loadCharacters, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CharactersActions.loadCharactersSuccess, (state, { characters, total, page }) => ({
    ...state,
    characters,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / 10),
    loading: false,
    error: null
  })),
  on(CharactersActions.loadCharactersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CharactersActions.loadCharacterById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CharactersActions.loadCharacterByIdSuccess, (state, { character }) => ({
    ...state,
    selectedCharacter: character,
    loading: false,
    error: null
  })),
  on(CharactersActions.loadCharacterByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CharactersActions.setSearchParams, (state, { searchParams }) => ({
    ...state,
    searchParams,
    currentPage: 1
  })),
  on(CharactersActions.clearSearchParams, (state) => ({
    ...state,
    searchParams: null,
    currentPage: 1
  })),
  on(CharactersActions.setCurrentPage, (state, { page }) => ({
    ...state,
    currentPage: page
  }))
);