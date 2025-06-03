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
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="character-card fade-in" (click)="onCardClick()">
      <mat-card-header>
        <div mat-card-avatar class="character-avatar">
          <mat-icon [class.alive]="isAlive" [class.dead]="!isAlive">
            {{ isAlive ? 'person' : 'person_off' }}
          </mat-icon>
        </div>
        <mat-card-title>{{ displayName }}</mat-card-title>
        <mat-card-subtitle *ngIf="character.culture">{{ character.culture }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Status indicators -->
        <div class="status-indicators">
          <mat-chip-set>
            <mat-chip [class.alive-chip]="isAlive" [class.dead-chip]="!isAlive">
              {{ isAlive ? 'Alive' : 'Deceased' }}
            </mat-chip>
            <mat-chip *ngIf="character.gender" class="gender-chip">
              {{ character.gender }}
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Titles -->
        <div class="character-titles" *ngIf="character.titles?.length">
          <h4>Titles:</h4>
          <div class="titles-list">
            <mat-chip-set>
              <mat-chip 
                *ngFor="let title of displayTitles; trackBy: trackByTitle"
                class="title-chip"
                [matTooltip]="title"
              >
                {{ title }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <!-- Aliases -->
        <div class="character-aliases" *ngIf="character.aliases?.length">
          <h4>Also known as:</h4>
          <div class="aliases-list">
            <mat-chip-set>
              <mat-chip 
                *ngFor="let alias of displayAliases; trackBy: trackByAlias"
                class="alias-chip"
                [matTooltip]="alias"
              >
                {{ alias }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <!-- Birth/Death info -->
        <div class="life-info" *ngIf="character.born || character.died">
          <div *ngIf="character.born" class="birth-info">
            <mat-icon>cake</mat-icon>
            <span>Born: {{ character.born }}</span>
          </div>
          <div *ngIf="character.died" class="death-info">
            <mat-icon>event_busy</mat-icon>
            <span>Died: {{ character.died }}</span>
          </div>
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button 
          mat-icon-button 
          [color]="isFavorite ? 'warn' : 'primary'"
          (click)="onToggleFavorite($event)"
          [matTooltip]="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          class="favorite-button"
        >
          <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
        
        <button 
          mat-button 
          color="primary"
          [routerLink]="['/characters', characterId]"
          (click)="$event.stopPropagation()"
        >
          View Details
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .character-card {
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .character-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .character-avatar {
      background-color: #f5f5f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .character-avatar mat-icon {
      font-size: 1.5rem;
    }

    .character-avatar mat-icon.alive {
      color: #4caf50;
    }

    .character-avatar mat-icon.dead {
      color: #f44336;
    }

    mat-card-content {
      flex-grow: 1;
    }

    .status-indicators {
      margin-bottom: 1rem;
    }

    .alive-chip {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .dead-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .gender-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .character-titles,
    .character-aliases {
      margin-bottom: 1rem;
    }

    .character-titles h4,
    .character-aliases h4 {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #666;
    }

    .titles-list,
    .aliases-list {
      max-height: 60px;
      overflow: hidden;
    }

    .title-chip {
      background-color: #fff3e0 !important;
      color: #ef6c00 !important;
      margin-bottom: 0.25rem;
    }

    .alias-chip {
      background-color: #f3e5f5 !important;
      color: #7b1fa2 !important;
      margin-bottom: 0.25rem;
    }

    .life-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .birth-info,
    .death-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .birth-info mat-icon {
      color: #4caf50;
      font-size: 1rem;
    }

    .death-info mat-icon {
      color: #f44336;
      font-size: 1rem;
    }

    mat-card-actions {
      margin-top: auto;
      padding-top: 1rem;
    }

    .favorite-button {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .character-card {
        margin-bottom: 1rem;
      }

      .titles-list,
      .aliases-list {
        max-height: 40px;
      }
    }
  `]
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
    return this.character.titles.filter(title => title && title.trim() !== '').slice(0, 3);
  }

  get displayAliases(): string[] {
    if (!this.character.aliases) return [];
    return this.character.aliases.filter(alias => alias && alias.trim() !== '').slice(0, 2);
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