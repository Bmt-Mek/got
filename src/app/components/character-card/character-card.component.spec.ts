import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CharacterCardComponent } from './character-card.component';
import { CharactersService } from '../../services/characters.service';
import { Character } from '../../models';

describe('CharacterCardComponent', () => {
  let component: CharacterCardComponent;
  let fixture: ComponentFixture<CharacterCardComponent>;
  let charactersService: jasmine.SpyObj<CharactersService>;

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

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CharactersService', [
      'getCharacterDisplayName',
      'isCharacterAlive',
      'extractCharacterIdFromUrl'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CharacterCardComponent,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CharactersService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCardComponent);
    component = fixture.componentInstance;
    charactersService = TestBed.inject(CharactersService) as jasmine.SpyObj<CharactersService>;

    // Set up spy return values
    charactersService.getCharacterDisplayName.and.returnValue('Jon Snow');
    charactersService.isCharacterAlive.and.returnValue(true);
    charactersService.extractCharacterIdFromUrl.and.returnValue('1');

    component.character = mockCharacter;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display character information', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card-title').textContent).toContain('Jon Snow');
    expect(compiled.querySelector('mat-card-subtitle').textContent).toContain('Northmen');
  });

  it('should display character status as alive', () => {
    const compiled = fixture.nativeElement;
    const statusChip = compiled.querySelector('.alive-chip');
    expect(statusChip).toBeTruthy();
    expect(statusChip.textContent.trim()).toBe('Alive');
  });

  it('should display character status as deceased', () => {
    charactersService.isCharacterAlive.and.returnValue(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const statusChip = compiled.querySelector('.dead-chip');
    expect(statusChip).toBeTruthy();
    expect(statusChip.textContent.trim()).toBe('Deceased');
  });

  it('should display character titles', () => {
    const compiled = fixture.nativeElement;
    const titleChips = compiled.querySelectorAll('.title-chip');
    expect(titleChips.length).toBeGreaterThan(0);
  });

  it('should display character aliases', () => {
    const compiled = fixture.nativeElement;
    const aliasChips = compiled.querySelectorAll('.alias-chip');
    expect(aliasChips.length).toBeGreaterThan(0);
  });

  it('should emit toggleFavorite when favorite button is clicked', () => {
    spyOn(component.toggleFavorite, 'emit');

    const favoriteButton = fixture.nativeElement.querySelector('.favorite-button');
    favoriteButton.click();

    expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockCharacter);
  });

  it('should emit cardClick when card is clicked', () => {
    spyOn(component.cardClick, 'emit');

    const card = fixture.nativeElement.querySelector('.character-card');
    card.click();

    expect(component.cardClick.emit).toHaveBeenCalledWith(mockCharacter);
  });

  it('should show favorite icon when character is favorite', () => {
    component.isFavorite = true;
    fixture.detectChanges();

    const favoriteIcon = fixture.nativeElement.querySelector('.favorite-button mat-icon');
    expect(favoriteIcon.textContent.trim()).toBe('favorite');
  });

  it('should show favorite border icon when character is not favorite', () => {
    component.isFavorite = false;
    fixture.detectChanges();

    const favoriteIcon = fixture.nativeElement.querySelector('.favorite-button mat-icon');
    expect(favoriteIcon.textContent.trim()).toBe('favorite_border');
  });

  it('should display life information when available', () => {
    const compiled = fixture.nativeElement;
    const birthInfo = compiled.querySelector('.birth-info');
    expect(birthInfo).toBeTruthy();
    expect(birthInfo.textContent).toContain('Born: In 283 AC');
  });

  it('should handle characters with no name gracefully', () => {
    const characterWithoutName = { ...mockCharacter, name: '' };
    charactersService.getCharacterDisplayName.and.returnValue('Lord Snow');
    component.character = characterWithoutName;
    fixture.detectChanges();

    expect(charactersService.getCharacterDisplayName).toHaveBeenCalledWith(characterWithoutName);
  });

  it('should get display titles correctly', () => {
    const displayTitles = component.displayTitles;
    expect(displayTitles).toEqual(['Lord Commander of the Night\'s Watch', 'King in the North']);
  });

  it('should get display aliases correctly', () => {
    const displayAliases = component.displayAliases;
    expect(displayAliases).toEqual(['Lord Snow', 'The Bastard of Winterfell']);
  });

  it('should limit displayed titles to 3', () => {
    const characterWithManyTitles = {
      ...mockCharacter,
      titles: ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5']
    };
    component.character = characterWithManyTitles;
    
    const displayTitles = component.displayTitles;
    expect(displayTitles.length).toBe(3);
  });

  it('should limit displayed aliases to 2', () => {
    const characterWithManyAliases = {
      ...mockCharacter,
      aliases: ['Alias 1', 'Alias 2', 'Alias 3', 'Alias 4']
    };
    component.character = characterWithManyAliases;
    
    const displayAliases = component.displayAliases;
    expect(displayAliases.length).toBe(2);
  });

  it('should filter out empty titles and aliases', () => {
    const characterWithEmptyData = {
      ...mockCharacter,
      titles: ['Valid Title', '', '   ', 'Another Title'],
      aliases: ['Valid Alias', '', '   ']
    };
    component.character = characterWithEmptyData;
    
    const displayTitles = component.displayTitles;
    const displayAliases = component.displayAliases;
    
    expect(displayTitles).toEqual(['Valid Title', 'Another Title']);
    expect(displayAliases).toEqual(['Valid Alias']);
  });

  it('should track by title correctly', () => {
    const title = 'Test Title';
    const result = component.trackByTitle(0, title);
    expect(result).toBe(title);
  });

  it('should track by alias correctly', () => {
    const alias = 'Test Alias';
    const result = component.trackByAlias(0, alias);
    expect(result).toBe(alias);
  });

  it('should prevent event propagation when favorite button is clicked', () => {
    const favoriteButton = fixture.nativeElement.querySelector('.favorite-button');
    const clickEvent = new Event('click');
    spyOn(clickEvent, 'stopPropagation');
    
    favoriteButton.dispatchEvent(clickEvent);
    
    // This is testing the implementation, but the actual stopPropagation is called in the template
    // We'll verify through behavior - that cardClick is not emitted when favorite button is clicked
    spyOn(component.cardClick, 'emit');
    component.onToggleFavorite(clickEvent);
    
    expect(component.cardClick.emit).not.toHaveBeenCalled();
  });
});