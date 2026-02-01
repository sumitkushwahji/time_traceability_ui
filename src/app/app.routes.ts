import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { BangaloreComponent } from './pages/bangalore/bangalore.component';
import { BhubaneshwarComponent } from './pages/bhubaneshwar/bhubaneshwar.component';
import { FaridabadComponent } from './pages/faridabad/faridabad.component';
import { GuwahatiComponent } from './pages/guwahati/guwahati.component';
import { DrcComponent } from './pages/drc/drc.component';
import { FileUploadDashboardComponent } from './shared/file-upload-dashboard/file-upload-dashboard.component';
import { FileStatusGridComponent } from './shared/file-status-grid/file-status-grid.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { rootGuard } from './guards/root.guard';

export const routes: Routes = [
  {
    path: 'landing',
    component: LandingComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '',
    canActivate: [rootGuard],
    children: [],
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Redirect empty path to 'dashboard'
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      { 
        path: 'home', 
        component: HomeComponent,
        canActivate: [authGuard],
        data: { roles: ['APP-USER'] }
      },
      {
        path: 'ahmedabad',
        loadChildren: () =>
          import('./pages/ahmedabad/ahmedabad.module').then(
            (m) => m.AhmedabadModule
          ),
      },
      {
        path: 'bangalore',
        loadChildren: () =>
          import('./pages/bangalore/bangalore.module').then(
            (m) => m.BangaloreModule
          ),
      },
      {
        path: 'bhubaneshwar',
        loadChildren: () =>
          import('./pages/bhubaneshwar/bhubaneshwar.module').then(
            (m) => m.BhubaneshwarModule
          ),
      },
      {
        path: 'faridabad',
        loadChildren: () =>
          import('./pages/faridabad/faridabad.module').then(
            (m) => m.FaridabadModule
          ),
      },
      {
        path: 'guwahati',
        loadChildren: () =>
          import('./pages/guwahati/guwahati.module').then(
            (m) => m.GuwahatiModule
          ),
      },
      {
        path: 'drc',
        loadChildren: () =>
          import('./pages/drc/drc.module').then((m) => m.DrcModule),
      },
      {
        path: 'shared',
        loadChildren: () =>
          import('./shared/views/shared-views.module').then((m) => m.SharedViewsModule),
      },
      {
        path: 'file-upload-stats',
        component: FileUploadDashboardComponent,
      },
      {
        path: 'file-status-grid',
        component: FileStatusGridComponent,
      },
      {
        path: 'documentation',
        component: DocumentationComponent,
      },
    ],
  },
];
