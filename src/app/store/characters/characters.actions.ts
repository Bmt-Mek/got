import { createAction, props } from '@ngrx/store';
import { Character, CharacterSearchParams } from '../../models';

export const loadCharacters = createAction(
  '[Characters] Load Characters',
  props<{ page?: number; searchParams?: CharacterSearchParams }>()
);

export const loadCharactersSuccess = createAction(
  '[Characters] Load Characters Success',
  props<{ characters: Character[]; total: number; page: number }>()
);

export const loadCharactersFailure = createAction(
  '[Characters] Load Characters Failure',
  props<{ error: string }>()
);

export const loadCharacterById = createAction(
  '[Characters] Load Character By ID',
  props<{ id: string }>()
);

export const loadCharacterByIdSuccess = createAction(
  '[Characters] Load Character By ID Success',
  props<{ character: Character }>()
);

export const loadCharacterByIdFailure = createAction(
  '[Characters] Load Character By ID Failure',
  props<{ error: string }>()
);

export const searchCharacters = createAction(
  '[Characters] Search Characters',
  props<{ searchTerm: string }>()
);

export const setSearchParams = createAction(
  '[Characters] Set Search Params',
  props<{ searchParams: CharacterSearchParams }>()
);

export const clearSearchParams = createAction(
  '[Characters] Clear Search Params'
);

export const setCurrentPage = createAction(
  '[Characters] Set Current Page',
  props<{ page: number }>()
);