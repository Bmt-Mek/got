import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CharacterSearchParams } from '../../models';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatExpansionModule
  ],
  template: `
    <div class="search-container">
      <!-- Quick Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search characters...</mat-label>
        <input 
          matInput 
          [formControl]="searchControl"
          placeholder="Enter character name"
          autocomplete="off"
        >
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <!-- Advanced Search Panel -->
      <mat-expansion-panel class="advanced-search-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            Advanced Filters
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="advanced-filters">
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select [formControl]="genderControl">
                <mat-option value="">All</mat-option>
                <mat-option value="Male">Male</mat-option>
                <mat-option value="Female">Female</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Culture</mat-label>
              <input 
                matInput 
                [formControl]="cultureControl"
                placeholder="e.g., Northmen, Dornish"
              >
            </mat-form-field>
          </div>

          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Born</mat-label>
              <input 
                matInput 
                [formControl]="bornControl"
                placeholder="Birth year or description"
              >
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">All</mat-option>
                <mat-option value="true">Alive</mat-option>
                <mat-option value="false">Deceased</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="filter-actions">
            <button mat-button (click)="onClearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
            <button mat-raised-button color="primary" (click)="onApplyFilters()">
              <mat-icon>search</mat-icon>
              Apply Filters
            </button>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .search-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto 2rem;
    }

    .search-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .advanced-search-panel {
      margin-bottom: 1rem;
    }

    .advanced-filters {
      padding: 1rem 0;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    @media (max-width: 480px) {
      .filter-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    mat-expansion-panel-header {
      background-color: #f8f9fa;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() initialSearchParams?: CharacterSearchParams | null;
  @Output() search = new EventEmitter<string>();
  @Output() advancedSearch = new EventEmitter<CharacterSearchParams>();
  @Output() clearSearch = new EventEmitter<void>();

  searchControl = new FormControl('');
  genderControl = new FormControl('');
  cultureControl = new FormControl('');
  bornControl = new FormControl('');
  statusControl = new FormControl('');

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Set up search input debouncing
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null) {
        this.search.emit(value);
      }
    });

    // Initialize with existing search params if provided
    if (this.initialSearchParams) {
      this.setSearchParams(this.initialSearchParams);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onApplyFilters(): void {
    const searchParams: CharacterSearchParams = {};

    if (this.searchControl.value) {
      searchParams.name = this.searchControl.value;
    }
    if (this.genderControl.value) {
      searchParams.gender = this.genderControl.value;
    }
    if (this.cultureControl.value) {
      searchParams.culture = this.cultureControl.value;
    }
    if (this.bornControl.value) {
      searchParams.born = this.bornControl.value;
    }
    if (this.statusControl.value !== null && this.statusControl.value !== '') {
      searchParams.isAlive = this.statusControl.value === 'true';
    }

    this.advancedSearch.emit(searchParams);
  }

  onClearFilters(): void {
    this.searchControl.setValue('');
    this.genderControl.setValue('');
    this.cultureControl.setValue('');
    this.bornControl.setValue('');
    this.statusControl.setValue('');
    this.clearSearch.emit();
  }

  private setSearchParams(params: CharacterSearchParams): void {
    if (params.name) {
      this.searchControl.setValue(params.name);
    }
    if (params.gender) {
      this.genderControl.setValue(params.gender);
    }
    if (params.culture) {
      this.cultureControl.setValue(params.culture);
    }
    if (params.born) {
      this.bornControl.setValue(params.born);
    }
    if (params.isAlive !== undefined) {
      this.statusControl.setValue(params.isAlive.toString());
    }
  }
}