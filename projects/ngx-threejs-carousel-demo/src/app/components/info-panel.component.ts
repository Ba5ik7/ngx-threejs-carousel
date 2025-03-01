import { Component, inject } from '@angular/core';
import { AppService } from '../services/app.service';
import { AsyncPipe } from '@angular/common';

// stagger-text.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'staggerText',
})
export class StaggerTextPipe implements PipeTransform {
  transform(value: string): string[] {
    return value ? value.split('') : [];
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
            [style.animationDelay]="$index * 0.1 + 's'"
          >
            {{ char }}
          </span>
        }
      </h1>
    </div>
  `,
  styles: [
    `
      .info-panel {
        display: block;
        position: relative;
        right: 100px;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--mat-sys-primary);
        height: calc(100% - 128px);
        margin: 64px 24px 24px 24px;
        padding: 0 24px;
        border-radius: 16px;
        overflow-y: auto;
        width: 100%;
        h1 {
          font-weight: 100;
          /* styles.css or component-specific CSS */
          .neon-animation {
            opacity: 0;
            display: inline-block;
            animation: neonFadeIn 5s forwards;
          }

          @keyframes neonFadeIn {
            0% {
              opacity: 0;
              color: #39ff14; /* bright neon green */
              text-shadow: 0 0 10px #39ff14;
            }
            50% {
              opacity: 1;
              color: var(--mat-sys-primary);
              text-shadow: none;
            }
            100% {
              opacity: 1;
              text-shadow: none;
            }
          }
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  currentProject$ = inject(AppService).curentProject$;
  title = 'Ngx-Workshop';

  ngOnInit() {
    console.log('InfoPanelComponent initialized');
  }

  ngOnDestroy() {
    console.log('InfoPanelComponent destroyed');
  }
}
