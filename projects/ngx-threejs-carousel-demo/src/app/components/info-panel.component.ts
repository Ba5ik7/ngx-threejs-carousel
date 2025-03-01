import { Component, inject } from '@angular/core';
import { AppService } from '../services/app.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="info-panel">
      <h1>{{ title }} {{ currentProject$ | async }}</h1>
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
        max-width: 360px;
        width: 100%;
        h1 {
          font-weight: 100;
        }
      }
    `,
  ],
})
export class InfoPanelComponent {
  currentProject$ = inject(AppService).curentProject$;
  title = 'Ngx-Workshop';
}
