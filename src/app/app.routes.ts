import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { BangaloreComponent } from './pages/bangalore/bangalore.component';
import { BhubaneshwarComponent } from './pages/bhubaneshwar/bhubaneshwar.component';
import { FaridabadComponent } from './pages/faridabad/faridabad.component';
import { GuwahatiComponent } from './pages/guwahati/guwahati.component';
import { DrcComponent } from './pages/drc/drc.component';

export const routes: Routes = [
  {
    // path: '',
    // component: LayoutComponent,
    // children: [
    //   { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    //   {
    //     path: 'dashboard',
    //     loadChildren: () =>
    //       import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
    //   },
    //   {
    //     path: 'ahmedabad',
    //     loadChildren: () =>
    //       import('./pages/ahmedabad/ahmedabad.module').then(m => m.AhmedabadModule),
    //   },
    //   {
    //     path: 'bangalore',
    //     loadChildren: () =>
    //       import('./pages/bangalore/bangalore.module').then(m => m.BangaloreModule),
    //   },

    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },

      { path: 'home', component: HomeComponent },
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

      // Add more routes like 'settings'
    ],
  },
];
