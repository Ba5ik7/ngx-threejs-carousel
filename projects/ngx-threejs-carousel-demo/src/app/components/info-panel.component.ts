import { Component, inject } from '@angular/core';
import { AppService } from '../services/app.service';
import { Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Pipe({
  name: 'staggerText',
})
export class StaggerTextPipe implements PipeTransform {
  transform(value: string): string[] {
    return value
      ? value.split('').map((char) => (char === ' ' ? '\u00A0' : char))
      : [];
  }
}

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [AsyncPipe, StaggerTextPipe, MatButtonModule, MatIcon],
  template: `
    <div class="info-panel">
      @if(currentProjectRepo$ | async; as project) {

      <div class="content">
        <h1>
          @for (char of project.name | staggerText; track $index) {
          <span
            class="neon-animation"
            [style.animationDelay]="($index + 14) * 0.1 + 's'"
          >
            {{ char }}
          </span>
          }
        </h1>
        <p>
          @for (char of project.description | staggerText; track $index) {
          <span
            class="neon-animation"
            [style.animationDelay]="($index + 60) * 0.03 + 's'"
          >
            {{ char }}
          </span>
          }
        </p>
      </div>

      <div class="action-group">
        <a [href]="project.url" target="blank"
          ><img [src]="project.previewImage" alt="3d model"
        /></a>
        <p>
          <button mat-flat-button href="">Webpage</button>
        </p>
      </div>
      }

      <div class="nav-action-group">
        <button mat-icon-button (click)="nextProject()">
          <mat-icon>arrow_forward</mat-icon>
        </button>
        <button mat-icon-button (click)="previousProject()">
          <mat-icon>arrow_back</mat-icon>
        </button>

      </div>
    </div>
  `,
  styles: [
    `
      .info-panel {
        display: flex;
        position: relative;
        max-width: 768px;
        height: calc(100% - 128px);
        background-color: rgba(0, 0, 0, 0.8);
        // background-color: var(--mat-sys-secondary-container);
        gap: 24px;
        margin: 205px 0;
        padding: 24px;
        border-radius: 16px;

        img {
          max-height: 160px;
          border-radius: 8px;
        }

        h1 {
          color: var(--mat-sys-on-primary-container);
          margin: 0.3em 0;
        }

        p {
          font: var(--mat-sys-title-large);
          color: var(--mat-sys-on-secondary-container);
        }

        .action-group {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }
        .action-nav-group {
          width: 40px;
        }

        .neon-animation {
          opacity: 0;
          display: inline-block;
          animation: neonFadeIn 0.4s forwards;
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  appService = inject(AppService);
  router = inject(Router);
  currentProjectRepo$ = this.appService.curentProjectRepo$;

  nextProject() {
    this.router.navigate([
      '/project',
      // Ensure the project ID wraps around correctly REPO_LIMIT = 10;
      // If you have more than 10 projects, adjust this logic accordingly.
      0 === this.appService.currentProject.value
        ? 0
        : 0 === this.appService.currentProject.value % 10
        ? 0
        : this.appService.currentProject.value + 1,
      // this.appService.currentProject.value + 1,

    ]);
  }

  previousProject() {
    this.router.navigate([
      '/project',
      (this.appService.currentProject.value - 1),
    ]);
  }
}
