import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title fade-in">
                Explore the World of
                <span class="accent-text">Game of Thrones</span>
              </h1>
              <p class="hero-description fade-in">
                Discover characters, houses, and their intricate relationships from George R.R. Martin's epic fantasy series. 
                Build your collection of favorite characters and dive deep into the lore of Westeros and beyond.
              </p>
              <div class="hero-actions fade-in">
                <button 
                  mat-raised-button 
                  color="primary" 
                  size="large"
                  routerLink="/characters"
                  class="cta-button"
                >
                  <mat-icon>people</mat-icon>
                  Browse Characters
                </button>
                <button 
                  mat-stroked-button 
                  color="primary" 
                  size="large"
                  routerLink="/favorites"
                  class="secondary-button"
                >
                  <mat-icon>favorite</mat-icon>
                  My Favorites
                </button>
              </div>
            </div>
            <div class="hero-image">
              <div class="image-placeholder">
                <mat-icon class="hero-icon">castle</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section section">
        <div class="container">
          <h2 class="section-title text-center">Discover & Collect</h2>
          <div class="features-grid">
            <mat-card class="feature-card slide-in">
              <mat-card-header>
                <div mat-card-avatar class="feature-avatar search-avatar">
                  <mat-icon>search</mat-icon>
                </div>
                <mat-card-title>Search & Filter</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Find characters by name, culture, status, and more with our advanced search and filtering capabilities.</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="feature-card slide-in">
              <mat-card-header>
                <div mat-card-avatar class="feature-avatar details-avatar">
                  <mat-icon>info</mat-icon>
                </div>
                <mat-card-title>Rich Details</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Explore comprehensive character information including titles, allegiances, and their role in the series.</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="feature-card slide-in">
              <mat-card-header>
                <div mat-card-avatar class="feature-avatar favorites-avatar">
                  <mat-icon>favorite</mat-icon>
                </div>
                <mat-card-title>Personal Collection</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Save your favorite characters and build your personal collection to track the characters you love most.</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="feature-card slide-in">
              <mat-card-header>
                <div mat-card-avatar class="feature-avatar responsive-avatar">
                  <mat-icon>devices</mat-icon>
                </div>
                <mat-card-title>Mobile Friendly</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Enjoy a seamless experience across all your devices with our responsive, mobile-first design.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">2000+</div>
              <div class="stat-label">Characters</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">400+</div>
              <div class="stat-label">Houses</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">8</div>
              <div class="stat-label">Seasons</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5</div>
              <div class="stat-label">Books</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Begin Your Journey?</h2>
            <p>Join thousands of fans exploring the rich world of Game of Thrones</p>
            <div class="cta-buttons">
              <button 
                mat-raised-button 
                color="primary" 
                size="large"
                routerLink="/characters"
              >
                <mat-icon>explore</mat-icon>
                Start Exploring
              </button>
              <button 
                mat-stroked-button 
                color="primary" 
                size="large"
                routerLink="/favorites"
              >
                <mat-icon>favorite</mat-icon>
                View Favorites
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 0;
      min-height: 60vh;
      display: flex;
      align-items: center;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: center;
    }

    @media (min-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
      }
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
      .hero-title {
        font-size: 3.5rem;
      }
    }

    .accent-text {
      color: #ffd54f;
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .hero-actions {
        flex-direction: row;
        gap: 1.5rem;
      }
    }

    .cta-button,
    .secondary-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
    }

    .hero-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .image-placeholder {
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .hero-icon {
      font-size: 8rem;
      width: 8rem;
      height: 8rem;
      color: rgba(255, 255, 255, 0.8);
    }

    /* Features Section */
    .features-section {
      background-color: #f8f9fa;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 3rem;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .feature-card {
      text-align: center;
      height: 100%;
      transition: transform 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin: 0 auto;
    }

    .search-avatar {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .details-avatar {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .favorites-avatar {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .responsive-avatar {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    /* Stats Section */
    .stats-section {
      background-color: #333;
      color: white;
      padding: 3rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: #ffd54f;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.8;
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: center;
    }

    @media (min-width: 768px) {
      .cta-buttons {
        flex-direction: row;
        gap: 1.5rem;
      }
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.8s ease-out;
    }

    .slide-in {
      animation: slideIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class LandingComponent {
  constructor() {}
}