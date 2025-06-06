import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, merge, Observable, Subject } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppState } from '../../../store';
import {
  selectAuthLoading,
  selectAuthError,
} from '../../../store/auth/auth.selectors';
import { login, clearAuthError } from '../../../store/auth/auth.actions';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup<LoginForm>;
  hidePassword = true;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  showContent$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.loginForm = this.fb.group<LoginForm>({
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.isLoading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.showContent$ = merge(this.isLoading$, this.error$).pipe(
      map(res => !!!res)
    );
  }

  ngOnInit(): void {
    // Clear any existing auth errors
    this.store.dispatch(clearAuthError());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginRequest = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      };
      this.store.dispatch(login({ credentials }));
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'demo@got-explorer.com',
      password: 'demo123',
    });
  }
}

export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
