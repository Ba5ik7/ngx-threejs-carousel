import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, Routes } from '@angular/router';
import { InfoPanelComponent } from './components/info-panel.component';
import { AppService } from './services/app.service';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DemoReuseStrategy extends RouteReuseStrategy {
  retrieve(): DetachedRouteHandle | null { return null; }
  shouldAttach(): boolean { return false; }
  shouldDetach(): boolean { return false; }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  store(): void {}
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig === curr.routeConfig) {
      return !future.data['alwaysRefresh'];
    } else {
        return false;
    }
  }
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/project/0',
    pathMatch: 'full'
  },

  {
    path: 'project',
    children: [
      {
        path: ':id',
        component: InfoPanelComponent,
        data: { animation: 'InfoPanelPage',alwaysRefresh: true },
        resolve: {
          project: (route: ActivatedRouteSnapshot) => {
            const appService = inject(AppService);
            const projectId = parseInt(route.paramMap.get('id')!, 10);
            appService.currentProject.next(projectId);
            return projectId;
          }
        }
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/project/0',
    pathMatch: 'full'
  }
];
