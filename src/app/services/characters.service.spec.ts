import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CharactersService } from './characters.service';
import { Character, CharacterSearchParams } from '../models';
import { environment } from '../../environments/environment';

describe('CharactersService', () => {
  let service: CharactersService;
  let httpMock: HttpTestingController;

  const mockCharacter: Character = {
    url: 'https://anapioficeandfire.com/api/characters/1',
    name: 'Jon Snow',
    gender: 'Male',
    culture: 'Northmen',
    born: 'In 283 AC',
    died: '',
    titles: ['Lord Commander of the Night\'s Watch', 'King in the North'],
    aliases: ['Lord Snow', 'The Bastard of Winterfell'],
    father: '',
    mother: '',
    spouse: '',
    allegiances: ['https://anapioficeandfire.com/api/houses/362'],
    books: [],
    povBooks: ['https://anapioficeandfire.com/api/books/1'],
    tvSeries: ['Season 1', 'Season 2'],
    playedBy: ['Kit Harington']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharactersService]
    });
    service = TestBed.inject(CharactersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should fetch characters with default parameters', () => {
      const mockResponse = [mockCharacter];
      const expectedUrl = `${environment.apiUrl}/characters?page=1&pageSize=10`;

      service.getCharacters().subscribe(response => {
        expect(response.data).toEqual(mockResponse);
        expect(response.page).toBe(1);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse, { 
        headers: { 'Link': '<https://anapioficeandfire.com/api/characters?page=2>; rel="next", <https://anapioficeandfire.com/api/characters?page=10>; rel="last"' }
      });
    });

    it('should fetch characters with custom page', () => {
      const page = 2;
      const expectedUrl = `${environment.apiUrl}/characters?page=2&pageSize=10`;

      service.getCharacters(page).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockCharacter]);
    });

    it('should fetch characters with search parameters', () => {
      const searchParams: CharacterSearchParams = {
        name: 'Jon',
        gender: 'Male',
        culture: 'Northmen'
      };

      service.getCharacters(1, searchParams).subscribe();

      const req = httpMock.expectOne(request => 
        request.url.includes('/characters') && 
        request.params.get('name') === 'Jon' &&
        request.params.get('gender') === 'Male' &&
        request.params.get('culture') === 'Northmen'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockCharacter]);
    });

    it('should handle error responses', () => {
      service.getCharacters().subscribe(response => {
        expect(response.data).toEqual([]);
        expect(response.total).toBe(0);
      });

      const req = httpMock.expectOne(request => request.url.includes('/characters'));
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getCharacterById', () => {
    it('should fetch a character by ID', () => {
      const characterId = '1';
      const expectedUrl = `${environment.apiUrl}/characters/${characterId}`;

      service.getCharacterById(characterId).subscribe(character => {
        expect(character).toEqual(mockCharacter);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);
    });

    it('should handle error when character not found', () => {
      const characterId = '999';

      service.getCharacterById(characterId).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/characters/${characterId}`);
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('searchCharacters', () => {
    it('should search characters by name', () => {
      const searchTerm = 'Jon Snow';

      service.searchCharacters(searchTerm).subscribe(response => {
        expect(response.data).toEqual([mockCharacter]);
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('/characters') && 
        request.params.get('name') === searchTerm
      );
      req.flush([mockCharacter]);
    });
  });

  describe('utility methods', () => {
    it('should extract character ID from URL', () => {
      const url = 'https://anapioficeandfire.com/api/characters/1';
      const id = service.extractCharacterIdFromUrl(url);
      expect(id).toBe('1');
    });

    it('should get character display name', () => {
      const character = { ...mockCharacter };
      let displayName = service.getCharacterDisplayName(character);
      expect(displayName).toBe('Jon Snow');

      // Test with no name but aliases
      character.name = '';
      displayName = service.getCharacterDisplayName(character);
      expect(displayName).toBe('Lord Snow');

      // Test with no name or aliases
      character.aliases = [];
      displayName = service.getCharacterDisplayName(character);
      expect(displayName).toBe('Unknown Character');
    });

    it('should check if character is alive', () => {
      let character = { ...mockCharacter };
      expect(service.isCharacterAlive(character)).toBe(true);

      character.died = 'In 300 AC';
      expect(service.isCharacterAlive(character)).toBe(false);
    });
  });

  describe('extractTotalFromLinkHeader', () => {
    it('should extract total from link header', () => {
      const linkHeader = '<https://anapioficeandfire.com/api/characters?page=2>; rel="next", <https://anapioficeandfire.com/api/characters?page=10>; rel="last"';
      
      // Test through the getCharacters method since extractTotalFromLinkHeader is private
      service.getCharacters().subscribe(response => {
        expect(response.total).toBe(100); // 10 pages * 10 items per page
      });

      const req = httpMock.expectOne(request => request.url.includes('/characters'));
      req.flush([mockCharacter], { headers: { 'Link': linkHeader } });
    });

    it('should handle missing link header', () => {
      service.getCharacters().subscribe(response => {
        expect(response.total).toBe(1); // Fallback to data length
      });

      const req = httpMock.expectOne(request => request.url.includes('/characters'));
      req.flush([mockCharacter]);
    });
  });
});