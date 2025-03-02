import { Component, inject } from '@angular/core';
import { AppService } from '../services/app.service';
import { Pipe, PipeTransform } from '@angular/core';

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
  imports: [StaggerTextPipe],
  template: `
    <div class="info-panel">
      <h1>
        @for (char of title | staggerText; track $index) {
        <span
          class="neon-animation"
          [style.animationDelay]="($index + 14) * 0.1 + 's'"
        >
          {{ char }}
        </span>
        }
      </h1>
      <p>
        <img src="assets/angular.png" alt="3d model" />
        @for (char of description | staggerText; track $index) {
          @if(char === "\n") { <br /> } @else {
          <span
            class="neon-animation"
            [style.animationDelay]="($index + 60) * 0.03 + 's'"
            >{{ char }}</span>
          }
        }
      </p>
      <p>
        <a href="">Github</a>
        <br />
        <a href="">Link to the Demo</a>
      </p>
    </div>
  `,
  styles: [
    `
      @keyframes neonFadeIn {
        0% {
          opacity: 0;
          color: #39ff14;
          text-shadow: 0 0 10px #39ff14;
        }
        25% {
          font-weight: 300;
        }
        50% {
          opacity: 1;
          font-weight: 500;
        }
        75% {
          font-weight: 300;
          text-shadow: none;
        }
        100% {
          opacity: 1;
          font-weight: 100;
          text-shadow: none;
        }
      }

      .info-panel {
        display: block;
        position: relative;
        background-color: rgba(0, 0, 0, 0.7);
        height: calc(100% - 128px);
        margin: 64px 24px;
        padding: 0 24px;
        border-radius: 16px;
        overflow-y: auto;
        width: 100%;
        max-width: 500px;
        min-height: 300px;

        img {
          width: 100%;
          border-radius: 8px;
        }

        h1 {
          color: var(--mat-sys-on-primary-container);
        }

        p {
          font: var(--mat-sys-title-large);
          color: var(--mat-sys-on-secondary-container);
        }

        h1,
        p {
          .neon-animation {
            opacity: 0;
            display: inline-block;
            animation: neonFadeIn 0.4s forwards;
          }
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  currentProject$ = inject(AppService).curentProject$;
  title = 'Ngx-Workshop';
  description = `Type help for a list of commands.\n
  - About to learn more about me\n
  - About to learn more about me\n
  - About to learn more about me\n
  - About to learn more about me\n
  - Past and current projects.\n`;
  ngOnInit() {
    console.log('InfoPanelComponent initialized');
  }

  ngOnDestroy() {
    console.log('InfoPanelComponent destroyed');
  }
}
