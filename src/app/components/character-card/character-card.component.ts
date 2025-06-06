import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Character } from '../../models';
import { CharactersService } from '../../services';

@Component({
  selector: 'app-character-card',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss'],
})
export class CharacterCardComponent {
  @Input() character!: Character;
  @Input() isFavorite: boolean = false;
  @Output() toggleFavorite = new EventEmitter<Character>();
  @Output() cardClick = new EventEmitter<Character>();

  constructor(private charactersService: CharactersService) {}

  get displayName(): string {
    return this.charactersService.getCharacterDisplayName(this.character);
  }

  get isAlive(): boolean {
    return this.charactersService.isCharacterAlive(this.character);
  }

  get characterId(): string {
    return this.charactersService.extractCharacterIdFromUrl(this.character.url);
  }

  get displayTitles(): string[] {
    if (!this.character.titles) return [];
    return this.character.titles
      .filter(title => title && title.trim() !== '')
      .slice(0, 3);
  }

  get displayAliases(): string[] {
    if (!this.character.aliases) return [];
    return this.character.aliases
      .filter(alias => alias && alias.trim() !== '')
      .slice(0, 2);
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.character);
  }

  onCardClick(): void {
    this.cardClick.emit(this.character);
  }

  trackByTitle(_: number, title: string): string {
    return title;
  }

  trackByAlias(_: number, alias: string): string {
    return alias;
  }
}
