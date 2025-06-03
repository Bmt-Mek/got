import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'got-auth-token';
  private readonly userKey = 'got-user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.backendUrl}/auth/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.backendUrl}/auth/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User> {
    const storedUser = this.getStoredUser();
    if (storedUser && this.getToken()) {
      this.currentUserSubject.next(storedUser);
      return of(storedUser);
    }

    // If we have a token but no stored user, try to fetch from backend
    if (this.getToken()) {
      return this.http.get<User>(`${environment.backendUrl}/auth/me`).pipe(
        tap(user => {
          this.setUser(user);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('Error fetching current user:', error);
          this.logout();
          throw error;
        })
      );
    }

    throw new Error('No authentication token found');
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.token);
    this.setUser(response.user);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  private setUser(user: User): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving stored user:', error);
      return null;
    }
  }

  private removeUser(): void {
    try {
      localStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
    }
  }

  // Check if token is expired (basic implementation)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}