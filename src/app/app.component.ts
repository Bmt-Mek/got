import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { AppState } from './store';
import { loadFavorites } from './store/favorites/favorites.actions';
import { checkAuthStatus } from './store/auth/auth.actions';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // Check authentication status
    this.store.dispatch(checkAuthStatus());
    // Load favorites from local storage
    this.store.dispatch(loadFavorites());
  }
}
