import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
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
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppState } from '../../../store';
import {
  selectAuthLoading,
  selectAuthError,
} from '../../../store/auth/auth.selectors';
import { register, clearAuthError } from '../../../store/auth/auth.actions';
import { RegisterRequest } from '../../../models';

// Custom validator for password confirmation
function passwordMatchValidator(
  control: AbstractControl
): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
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
    MatCheckboxModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup<RegisterForm>;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  showContent$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.registerForm = this.fb.group<RegisterForm>(
      {
        firstName: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        lastName: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        email: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.email,
        ]),
        password: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/),
        ]),
        confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
        acceptTerms: this.fb.nonNullable.control(false, [
          Validators.requiredTrue,
        ]),
      },
      { validators: passwordMatchValidator }
    );

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
    if (this.registerForm.valid) {
      const userData: RegisterRequest = {
        firstName: this.registerForm.value.firstName!,
        lastName: this.registerForm.value.lastName!,
        email: this.registerForm.value.email!,
        password: this.registerForm.value.password!,
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

export interface RegisterForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  acceptTerms: FormControl<boolean>;
}
