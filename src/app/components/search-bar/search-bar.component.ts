import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatExpansionModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
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
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
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
