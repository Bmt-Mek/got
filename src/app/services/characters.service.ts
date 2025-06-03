import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Character, CharacterSearchParams, PaginatedResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CharactersService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCharacters(page: number = 1, searchParams?: CharacterSearchParams): Observable<PaginatedResponse<Character>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', environment.itemsPerPage.toString());

    if (searchParams) {
      if (searchParams.name) {
        params = params.set('name', searchParams.name);
      }
      if (searchParams.gender) {
        params = params.set('gender', searchParams.gender);
      }
      if (searchParams.culture) {
        params = params.set('culture', searchParams.culture);
      }
      if (searchParams.born) {
        params = params.set('born', searchParams.born);
      }
      if (searchParams.died) {
        params = params.set('died', searchParams.died);
      }
      if (searchParams.isAlive !== undefined) {
        params = params.set('isAlive', searchParams.isAlive.toString());
      }
    }

    return this.http.get<Character[]>(`${this.baseUrl}/characters`, { 
      params,
      observe: 'response'
    }).pipe(
      map(response => {
        const characters = response.body || [];
        const linkHeader = response.headers.get('Link');
        const total = this.extractTotalFromLinkHeader(linkHeader) || characters.length;
        
        return {
          data: characters,
          total,
          page,
          pageSize: environment.itemsPerPage,
          hasNext: page * environment.itemsPerPage < total,
          hasPrev: page > 1
        };
      }),
      catchError(error => {
        console.error('Error fetching characters:', error);
        return of({
          data: [],
          total: 0,
          page,
          pageSize: environment.itemsPerPage,
          hasNext: false,
          hasPrev: false
        });
      })
    );
  }

  getCharacterById(id: string): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/characters/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching character:', error);
        throw error;
      })
    );
  }

  searchCharacters(searchTerm: string): Observable<PaginatedResponse<Character>> {
    const searchParams: CharacterSearchParams = {
      name: searchTerm
    };
    return this.getCharacters(1, searchParams);
  }

  private extractTotalFromLinkHeader(linkHeader: string | null): number | null {
    if (!linkHeader) return null;
    
    // Parse Link header to extract total count
    const lastMatch = linkHeader.match(/page=(\d+)[^>]*>;\s*rel="last"/);
    if (lastMatch) {
      const lastPage = parseInt(lastMatch[1], 10);
      return lastPage * environment.itemsPerPage;
    }
    
    return null;
  }

  // Utility method to extract character ID from URL
  extractCharacterIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }

  // Utility method to get character name for display
  getCharacterDisplayName(character: Character): string {
    if (character.name && character.name.trim()) {
      return character.name;
    }
    
    if (character.aliases && character.aliases.length > 0) {
      const validAlias = character.aliases.find(alias => alias && alias.trim());
      if (validAlias) {
        return validAlias;
      }
    }
    
    return 'Unknown Character';
  }

  // Utility method to check if character is alive
  isCharacterAlive(character: Character): boolean {
    return !character.died || character.died.trim() === '';
  }
}