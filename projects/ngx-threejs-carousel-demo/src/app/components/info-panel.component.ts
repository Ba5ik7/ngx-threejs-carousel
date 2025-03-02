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
      <img src="assets/angular.png" alt="3d model" />
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
        <a href="">Github</a> 🔥 <a href="">Link to the Demo</a>
      </p>
    </div>
  `,
  styles: [
    `
      .info-panel {
        display: block;
        position: relative;
        background-color: rgba(0, 0, 0, 0.8);
        // background-color: var(--mat-sys-secondary-container);
        height: calc(100% - 128px);
        margin: 205px 0;
        padding: 0 24px;
        border-radius: 16px;
        overflow-y: auto;
        width: 650px;
        min-height: 300px;

        img {
          // width: 100%;
          max-height: 160px;
          border-radius: 8px;
         margin-top: 0px;
         padding: 0px;
        }

        h1 {
          color: var(--mat-sys-on-primary-container);
          margin: 0;
          padding: 0;
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
  - About to learn more about me\n`;
  ngOnInit() {
    console.log('InfoPanelComponent initialized');
  }

  ngOnDestroy() {
    console.log('InfoPanelComponent destroyed');
  }
}
