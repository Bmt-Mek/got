import { Routes } from '@angular/router';
import { authGuard, noSessionGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('./pages/characters-list/characters-list.component').then(
        m => m.CharactersListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'characters/:id',
    loadComponent: () =>
      import('./pages/character-detail/character-detail.component').then(
        m => m.CharacterDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites.component').then(
        m => m.FavoritesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noSessionGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(
        m => m.RegisterComponent
      ),
    canActivate: [noSessionGuard],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
