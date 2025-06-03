import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../models';

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ authResponse: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ authResponse: AuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const logout = createAction(
  '[Auth] Logout'
);

export const logoutSuccess = createAction(
  '[Auth] Logout Success'
);

export const checkAuthStatus = createAction(
  '[Auth] Check Auth Status'
);

export const checkAuthStatusSuccess = createAction(
  '[Auth] Check Auth Status Success',
  props<{ user: User }>()
);

export const checkAuthStatusFailure = createAction(
  '[Auth] Check Auth Status Failure'
);

export const clearAuthError = createAction(
  '[Auth] Clear Auth Error'
);