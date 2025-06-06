import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, debounceTime } from 'rxjs/operators';
import { CharactersService } from '../../services/characters.service';
import * as CharactersActions from './characters.actions';

@Injectable()
export class CharactersEffects {
  constructor(
    private actions$: Actions,
    private charactersService: CharactersService
  ) {}

  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharactersActions.loadCharacters),
      switchMap(({ page = 1, searchParams }) =>
        this.charactersService.getCharacters(page, searchParams).pipe(
          map(response => CharactersActions.loadCharactersSuccess({
            characters: response.data,
            total: response.total,
            page: response.page
          })),
          catchError((error: { message: string }) => of(CharactersActions.loadCharactersFailure({
            error: error.message || 'Failed to load characters'
          })))
        )
      )
    )
  );

  loadCharacterById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharactersActions.loadCharacterById),
      switchMap(({ id }) =>
        this.charactersService.getCharacterById(id).pipe(
          map(character => CharactersActions.loadCharacterByIdSuccess({ character })),
          catchError((error: { message: string }) => of(CharactersActions.loadCharacterByIdFailure({
            error: error.message || 'Failed to load character'
          })))
        )
      )
    )
  );

  searchCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharactersActions.searchCharacters),
      debounceTime(300),
      switchMap(({ searchTerm }) =>
        this.charactersService.searchCharacters(searchTerm).pipe(
          map(response => CharactersActions.loadCharactersSuccess({
            characters: response.data,
            total: response.total,
            page: 1
          })),
          catchError((error: { message: string }) => of(CharactersActions.loadCharactersFailure({
            error: error.message || 'Failed to search characters'
          })))
        )
      )
    )
  );
}