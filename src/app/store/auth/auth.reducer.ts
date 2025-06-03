import { createReducer, on } from '@ngrx/store';
import { User } from '../../models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { authResponse }) => ({
    ...state,
    user: authResponse.user,
    token: authResponse.token,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(AuthActions.logout, AuthActions.logoutSuccess, () => ({
    ...initialState
  })),
  on(AuthActions.checkAuthStatus, (state) => ({
    ...state,
    isLoading: true
  })),
  on(AuthActions.checkAuthStatusSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false
  })),
  on(AuthActions.checkAuthStatusFailure, (state) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false
  })),
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null
  }))
);