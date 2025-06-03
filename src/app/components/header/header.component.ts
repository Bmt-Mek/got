import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../store';
import { selectFavoritesCount } from '../../store/favorites/favorites.selectors';
import { selectIsAuthenticated, selectUser } from '../../store/auth/auth.selectors';
import { logout } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo and Brand -->
          <div class="brand">
            <a routerLink="/" class="brand-link">
              <mat-icon class="brand-icon">castle</mat-icon>
              <span class="brand-text hidden-mobile">GoT Explorer</span>
              <span class="brand-text-short hidden-desktop">GoT</span>
            </a>
          </div>

          <!-- Navigation -->
          <nav class="nav-links">
            <a 
              mat-button 
              routerLink="/characters" 
              routerLinkActive="active"
              class="nav-link"
            >
              <mat-icon>people</mat-icon>
              <span class="hidden-mobile">Characters</span>
            </a>
            
            <a 
              mat-button 
              routerLink="/favorites" 
              routerLinkActive="active"
              class="nav-link"
              [matBadge]="favoritesCount$ | async"
              [matBadgeHidden]="(favoritesCount$ | async) === 0"
              matBadgeColor="accent"
            >
              <mat-icon>favorite</mat-icon>
              <span class="hidden-mobile">Favorites</span>
            </a>
          </nav>

          <!-- User Menu -->
          <div class="user-section">
            <!-- Authenticated User Menu -->
            <div *ngIf="isAuthenticated$ | async" class="user-menu">
              <button 
                mat-button 
                [matMenuTriggerFor]="userMenu"
                class="user-button"
              >
                <mat-icon>account_circle</mat-icon>
                <span class="hidden-mobile">{{ (user$ | async)?.firstName }}</span>
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
              
              <mat-menu #userMenu="matMenu">
                <div class="user-info">
                  <div class="user-name">{{ (user$ | async)?.firstName }} {{ (user$ | async)?.lastName }}</div>
                  <div class="user-email">{{ (user$ | async)?.email }}</div>
                </div>
                
                <mat-divider></mat-divider>
                
                <button mat-menu-item routerLink="/favorites">
                  <mat-icon>favorite</mat-icon>
                  <span>My Favorites</span>
                </button>
                
                <button mat-menu-item (click)="onLogout()">
                  <mat-icon>logout</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </div>

            <!-- Authentication Buttons -->
            <div *ngIf="!(isAuthenticated$ | async)" class="auth-buttons">
              <a mat-button routerLink="/login" class="login-button">
                <mat-icon>login</mat-icon>
                <span class="hidden-mobile">Login</span>
              </a>
              
              <a mat-raised-button color="accent" routerLink="/register" class="register-button">
                <mat-icon>person_add</mat-icon>
                <span class="hidden-mobile">Register</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 64px;
    }

    .brand {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .brand-icon {
      margin-right: 0.5rem;
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-info {
      padding: 1rem;
      text-align: center;
    }

    .user-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
      }

      .nav-links {
        gap: 0.25rem;
      }

      .auth-buttons {
        gap: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .nav-links {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
        padding: 0.5rem;
        justify-content: space-around;
        z-index: 1001;
      }

      .nav-link {
        flex-direction: column;
        min-width: 64px;
        color: #333;
      }

      .nav-link .mat-icon {
        margin-bottom: 0.25rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  favoritesCount$: Observable<number>;
  isAuthenticated$: Observable<boolean>;
  user$: Observable<any>;

  constructor(private store: Store<AppState>) {
    this.favoritesCount$ = this.store.select(selectFavoritesCount);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {}

  onLogout(): void {
    this.store.dispatch(logout());
  }
}