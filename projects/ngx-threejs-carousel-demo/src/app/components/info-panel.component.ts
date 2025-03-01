import { Component, inject } from "@angular/core";
import { AppService } from "../services/app.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  template: `
    <h1>{{ title }} {{ currentProject$ | async }}</h1>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        right: 0;
        // background-color: rgba(0, 0, 0, 0.5);
        background-color: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        // height: calc(100% - 48px);
        margin: 24px;
        padding: 0 24px;
        border-radius: 16px;
        overflow-y: auto;
        max-width: 360px;
        width: 100%;
        margin-top: 82px;
        h1 {
          font-weight: 100;
        }
      }
    `
  ]
})
export class InfoPanelComponent {
  currentProject$ = inject(AppService).curentProject$ ;
  title = 'Ngx-Workshop';
}
