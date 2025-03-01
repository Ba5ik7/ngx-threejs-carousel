import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CampGroundSceneComponent } from './components/camp-ground-scene.component';
import { AppService } from './services/app.service';
import { AsyncPipe } from '@angular/common';
import { NavBarComponent } from './components/nav-bar.component';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, RouterOutlet, NavBarComponent, CampGroundSceneComponent],
  template: `
    <app-nav-bar></app-nav-bar>
    <main>
    <router-outlet></router-outlet>
    <camp-ground-scene
      [currentProject]="(this.appService.curentProject$ | async) ?? 0"
      (projectIndexChanged)="router.navigate(['/project', $event])"
    ></camp-ground-scene>
    </main>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          // gap: 3em;
          // margin-top: 56px;
        }
        app-nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
        }
      }
    `,
  ],
})
export class AppComponent {
  router = inject(Router);
  appService = inject(AppService);
}
