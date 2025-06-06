import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Character } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly localStorageKey = 'got-favorites';
  private favoritesSubject = new BehaviorSubject<Character[]>([]);
  private useBackend = false; // Toggle based on auth status

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  getFavorites(): Observable<Character[]> {
    if (this.useBackend) {
      return this.http
        .get<Character[]>(`${environment.backendUrl}/favorites`)
        .pipe(
          tap(favorites => this.favoritesSubject.next(favorites)),
          catchError(error => {
            console.error('Error fetching favorites from backend:', error);
            return this.getFavoritesFromStorage();
          })
        );
    }

    return this.getFavoritesFromStorage();
  }

  addToFavorites(character: Character): Observable<void> {
    if (this.useBackend) {
      return this.http
        .post<void>(`${environment.backendUrl}/favorites`, character)
        .pipe(
          tap(() => {
            const currentFavorites = this.favoritesSubject.value;
            this.favoritesSubject.next([...currentFavorites, character]);
          }),
          catchError(error => {
            console.error('Error adding to favorites on backend:', error);
            return this.addToFavoritesLocally(character);
          })
        );
    }

    return this.addToFavoritesLocally(character);
  }

  removeFromFavorites(characterUrl: string): Observable<void> {
    if (this.useBackend) {
      return this.http
        .delete<void>(
          `${environment.backendUrl}/favorites/${encodeURIComponent(characterUrl)}`
        )
        .pipe(
          tap(() => {
            const currentFavorites = this.favoritesSubject.value;
            const updatedFavorites = currentFavorites.filter(
              char => char.url !== characterUrl
            );
            this.favoritesSubject.next(updatedFavorites);
          }),
          catchError(error => {
            console.error('Error removing from favorites on backend:', error);
            return this.removeFromFavoritesLocally(characterUrl);
          })
        );
    }

    return this.removeFromFavoritesLocally(characterUrl);
  }

  isFavorite(characterUrl: string): Observable<boolean> {
    return this.favoritesSubject
      .asObservable()
      .pipe(
        map(favorites => favorites.some(char => char.url === characterUrl))
      );
  }

  clearFavorites(): Observable<void> {
    if (this.useBackend) {
      return this.http.delete<void>(`${environment.backendUrl}/favorites`).pipe(
        tap(() => {
          this.favoritesSubject.next([]);
          this.clearFavoritesFromStorage();
        }),
        catchError(error => {
          console.error('Error clearing favorites on backend:', error);
          return this.clearFavoritesLocally();
        })
      );
    }

    return this.clearFavoritesLocally();
  }

  // Switch between backend and local storage based on auth status
  setUseBackend(useBackend: boolean): void {
    this.useBackend = useBackend;
    if (!useBackend) {
      this.loadFavoritesFromStorage();
    }
  }

  private getFavoritesFromStorage(): Observable<Character[]> {
    const favorites = this.loadFavoritesFromStorage();
    this.favoritesSubject.next(favorites);
    return of(favorites);
  }

  private addToFavoritesLocally(character: Character): Observable<void> {
    const currentFavorites = this.loadFavoritesFromStorage();
    const isAlreadyFavorite = currentFavorites.some(
      char => char.url === character.url
    );

    if (!isAlreadyFavorite) {
      const updatedFavorites = [...currentFavorites, character];
      this.saveFavoritesToStorage(updatedFavorites);
      this.favoritesSubject.next(updatedFavorites);
    }

    return of(void 0);
  }

  private removeFromFavoritesLocally(characterUrl: string): Observable<void> {
    const currentFavorites = this.loadFavoritesFromStorage();
    const updatedFavorites = currentFavorites.filter(
      char => char.url !== characterUrl
    );
    this.saveFavoritesToStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
    return of(void 0);
  }

  private clearFavoritesLocally(): Observable<void> {
    this.clearFavoritesFromStorage();
    this.favoritesSubject.next([]);
    return of(void 0);
  }

  private loadFavoritesFromStorage(): Character[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? (JSON.parse(stored) as Character[]) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  }

  private saveFavoritesToStorage(favorites: Character[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private clearFavoritesFromStorage(): void {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Error clearing favorites from localStorage:', error);
    }
  }
}
