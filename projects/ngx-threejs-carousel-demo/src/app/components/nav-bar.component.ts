import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemePickerComponent } from './theme-picker.component';
import { AppService } from '../services/app.service';
import { lastValueFrom } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [
    MatIcon,
    MatButtonModule,
    ThemePickerComponent,
  ],
  template: `
    <nav class="docs-navbar-header">
      <a
        mat-button
        href="https://github.com/Ba5ik7/ngx-editor-js2-blocks"
        target="_blank"
      >
        <mat-icon>school</mat-icon>Wesley William DuSell
      </a>
      <div class="flex-spacer"></div>
      <app-theme-picker></app-theme-picker>
    </nav>
  `,
  styles: [
    `
      :host {
        // color: var(--mat-sys-on-primary-container);
        .docs-navbar-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 0.5em 1em;
          mat-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
            margin: 0 0.1em 0.1875em 0;
            vertical-align: middle;
          }
        }
      }
    `,
  ],
})
export class NavBarComponent {
}
