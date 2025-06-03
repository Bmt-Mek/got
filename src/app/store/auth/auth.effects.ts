import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(authResponse => AuthActions.loginSuccess({ authResponse })),
          catchError(error => of(AuthActions.loginFailure({
            error: error.message || 'Login failed'
          })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ userData }) =>
        this.authService.register(userData).pipe(
          map(authResponse => AuthActions.registerSuccess({ authResponse })),
          catchError(error => of(AuthActions.registerFailure({
            error: error.message || 'Registration failed'
          })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(() => {
        this.router.navigate(['/characters']);
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.router.navigate(['/']);
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map(user => AuthActions.checkAuthStatusSuccess({ user })),
          catchError(() => of(AuthActions.checkAuthStatusFailure()))
        )
      )
    )
  );
}