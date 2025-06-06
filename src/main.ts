import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app/app.routes';
import { reducers } from './app/store';
import { CharactersEffects } from './app/store/characters/characters.effects';
import { FavoritesEffects } from './app/store/favorites/favorites.effects';
import { AuthEffects } from './app/store/auth/auth.effects';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideStore(reducers),
    provideEffects([CharactersEffects, FavoritesEffects, AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      connectInZone: true,
    }),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(MatSnackBarModule),
  ],
}).catch(err => console.error(err));
