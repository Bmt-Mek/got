import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppState } from '../../../store';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';
import { register, clearAuthError } from '../../../store/auth/auth.actions';
import { RegisterRequest } from '../../../models';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="register-page">
      <div class="container">
        <div class="register-container">
          <mat-card class="register-card">
            <mat-card-header>
              <div mat-card-avatar class="register-avatar">
                <mat-icon>person_add</mat-icon>
              </div>
              <mat-card-title>Create Account</mat-card-title>
              <mat-card-subtitle>Join the Game of Thrones community</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
                <!-- Name Fields -->
                <div class="name-fields">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input 
                      matInput 
                      formControlName="firstName"
                      placeholder="Enter your first name"
                      autocomplete="given-name"
                    >
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('minlength')">
                      Name must be at least 2 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input 
                      matInput 
                      formControlName="lastName"
                      placeholder="Enter your last name"
                      autocomplete="family-name"
                    >
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('minlength')">
                      Name must be at least 2 characters
                    </mat-error>
                  </mat-form-field>
                </div>

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
                  <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <!-- Password Fields -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input 
                    matInput 
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Create a password"
                    autocomplete="new-password"
                  >
                  <button 
                    mat-icon-button 
                    matSuffix 
                    type="button"
                    (click)="togglePasswordVisibility()"
                    [attr.aria-label]="'Hide password'"
                  >
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                    Password must contain at least one letter and one number
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm Password</mat-label>
                  <input 
                    matInput 
                    [type]="hideConfirmPassword ? 'password' : 'text'"
                    formControlName="confirmPassword"
                    placeholder="Confirm your password"
                    autocomplete="new-password"
                  >
                  <button 
                    mat-icon-button 
                    matSuffix 
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    [attr.aria-label]="'Hide password'"
                  >
                    <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                    Please confirm your password
                  </mat-error>
                  <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                    Passwords do not match
                  </mat-error>
                </mat-form-field>

                <!-- Terms and Conditions -->
                <div class="terms-section">
                  <mat-checkbox formControlName="acceptTerms" class="terms-checkbox">
                    I agree to the <a href="#" target="_blank">Terms of Service</a> and 
                    <a href="#" target="_blank">Privacy Policy</a>
                  </mat-checkbox>
                  <mat-error *ngIf="registerForm.get('acceptTerms')?.hasError('required') && registerForm.get('acceptTerms')?.touched">
                    You must accept the terms and conditions
                  </mat-error>
                </div>

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
                  [disabled]="registerForm.invalid || (isLoading$ | async)"
                  class="register-button"
                >
                  <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!(isLoading$ | async)">person_add</mat-icon>
                  {{ (isLoading$ | async) ? 'Creating account...' : 'Create Account' }}
                </button>
              </form>
            </mat-card-content>

            <mat-card-actions>
              <div class="card-actions">
                <p>Already have an account?</p>
                <a mat-button color="primary" routerLink="/login">
                  Sign In
                </a>
              </div>
            </mat-card-actions>
          </mat-card>

          <!-- Benefits -->
          <div class="benefits-section">
            <h3>Why join us?</h3>
            <div class="benefits-list">
              <div class="benefit-item">
                <mat-icon>favorite</mat-icon>
                <div>
                  <h4>Save Favorites</h4>
                  <p>Keep track of your favorite characters and build your personal collection</p>
                </div>
              </div>
              <div class="benefit-item">
                <mat-icon>cloud_sync</mat-icon>
                <div>
                  <h4>Sync Everywhere</h4>
                  <p>Access your favorites from any device, anywhere</p>
                </div>
              </div>
              <div class="benefit-item">
                <mat-icon>share</mat-icon>
                <div>
                  <h4>Share Collections</h4>
                  <p>Share your favorite characters with friends and fellow fans</p>
                </div>
              </div>
              <div class="benefit-item">
                <mat-icon>insights</mat-icon>
                <div>
                  <h4>Get Insights</h4>
                  <p>Discover new characters and explore deeper connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      padding: 2rem 0;
    }

    .register-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      align-items: start;
    }

    @media (min-width: 768px) {
      .register-container {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
      }
    }

    .register-card {
      max-width: 500px;
      width: 100%;
      margin: 0 auto;
    }

    .register-avatar {
      background-color: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .name-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 480px) {
      .name-fields {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .half-width {
        width: 100%;
      }
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 100%;
    }

    .terms-section {
      margin: 0.5rem 0;
    }

    .terms-checkbox {
      font-size: 0.875rem;
    }

    .terms-checkbox a {
      color: #1976d2;
      text-decoration: none;
    }

    .terms-checkbox a:hover {
      text-decoration: underline;
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

    .register-button {
      margin-top: 1rem;
      padding: 0.75rem;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .benefits-section {
      color: white;
      padding: 2rem;
    }

    @media (max-width: 767px) {
      .benefits-section {
        text-align: center;
        padding: 1rem;
      }
    }

    .benefits-section h3 {
      margin-bottom: 2rem;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .benefit-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    @media (max-width: 767px) {
      .benefit-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .benefit-item mat-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 0.75rem;
      color: #ffd54f;
      font-size: 1.5rem;
      width: 3rem;
      height: 3rem;
      flex-shrink: 0;
    }

    .benefit-item h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .benefit-item p {
      margin: 0;
      opacity: 0.9;
      line-height: 1.5;
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator });

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
    if (this.registerForm.valid) {
      const userData: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      this.store.dispatch(register({ userData }));
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}