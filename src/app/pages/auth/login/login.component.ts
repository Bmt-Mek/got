import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppState } from '../../../store';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';
import { login, clearAuthError } from '../../../store/auth/auth.actions';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <div class="container">
        <div class="login-container">
          <mat-card class="login-card">
            <mat-card-header>
              <div mat-card-avatar class="login-avatar">
                <mat-icon>login</mat-icon>
              </div>
              <mat-card-title>Welcome Back</mat-card-title>
              <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
                <!-- Email Field -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input 
                    matInput 
                    type="email" 
                    formControlName="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                  >
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <!-- Password Field -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input 
                    matInput 
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                  >
                  <button 
                    mat-icon-button 
                    matSuffix 
                    type="button"
                    (click)="togglePasswordVisibility()"
                    [attr.aria-label]="'Hide password'"
                    [attr.aria-pressed]="hidePassword"
                  >
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>

                <!-- Error Message -->
                <div *ngIf="error$ | async as error" class="error-message">
                  <mat-icon>error</mat-icon>
                  <span>{{ error }}</span>
                </div>

                <!-- Submit Button -->
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit"
                  [disabled]="loginForm.invalid || (isLoading$ | async)"
                  class="login-button"
                >
                  <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!(isLoading$ | async)">login</mat-icon>
                  {{ (isLoading$ | async) ? 'Signing in...' : 'Sign In' }}
                </button>
              </form>

              <!-- Demo Account Info -->
              <div class="demo-info">
                <h4>Demo Account</h4>
                <p>Use these credentials to test the application:</p>
                <div class="demo-credentials">
                  <p><strong>Email:</strong> demo&#64;got-explorer.com</p>
                  <p><strong>Password:</strong> demo123</p>
                </div>
                <button 
                  mat-button 
                  color="accent" 
                  (click)="fillDemoCredentials()"
                  class="demo-button"
                >
                  <mat-icon>flash_on</mat-icon>
                  Use Demo Account
                </button>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <div class="card-actions">
                <p>Don't have an account?</p>
                <a mat-button color="primary" routerLink="/register">
                  Create Account
                </a>
              </div>
            </mat-card-actions>
          </mat-card>

          <!-- Features Preview -->
          <div class="features-preview">
            <h3>What you'll get:</h3>
            <ul class="features-list">
              <li>
                <mat-icon>favorite</mat-icon>
                Save your favorite characters
              </li>
              <li>
                <mat-icon>sync</mat-icon>
                Sync across devices
              </li>
              <li>
                <mat-icon>search</mat-icon>
                Advanced search & filtering
              </li>
              <li>
                <mat-icon>share</mat-icon>
                Share your collections
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      padding: 2rem 0;
    }

    .login-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
      align-items: start;
    }

    @media (min-width: 768px) {
      .login-container {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
      }
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      margin: 0 auto;
    }

    .login-avatar {
      background-color: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      font-size: 0.875rem;
      padding: 0.5rem;
      background-color: #ffebee;
      border-radius: 4px;
      border-left: 4px solid #f44336;
    }

    .login-button {
      margin-top: 1rem;
      padding: 0.75rem;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .demo-info {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .demo-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .demo-info p {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #666;
    }

    .demo-credentials {
      margin: 0.75rem 0;
      padding: 0.75rem;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .demo-credentials p {
      margin: 0.25rem 0;
      font-family: monospace;
      font-size: 0.8rem;
    }

    .demo-button {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      text-align: center;
    }

    .card-actions p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .features-preview {
      color: white;
      padding: 2rem;
    }

    @media (max-width: 767px) {
      .features-preview {
        text-align: center;
        padding: 1rem;
      }
    }

    .features-preview h3 {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features-list li {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .features-list mat-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 0.5rem;
      color: #ffd54f;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.isLoading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
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
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
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
      password: 'demo123'
    });
  }
}