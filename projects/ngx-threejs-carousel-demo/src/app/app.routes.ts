import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { InfoPanelComponent } from './components/info-panel.component';
import { AppService } from './services/app.service';
import { inject } from '@angular/core';

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
