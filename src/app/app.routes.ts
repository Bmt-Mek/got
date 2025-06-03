import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'characters',
    loadComponent: () => import('./pages/characters-list/characters-list.component').then(m => m.CharactersListComponent)
  },
  {
    path: 'characters/:id',
    loadComponent: () => import('./pages/character-detail/character-detail.component').then(m => m.CharacterDetailComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];