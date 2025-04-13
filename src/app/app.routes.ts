import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { AhmedabadComponent } from './pages/ahmedabad/ahmedabad.component';
import { BangaloreComponent } from './pages/bangalore/bangalore.component';
import { BhubaneshwarComponent } from './pages/bhubaneshwar/bhubaneshwar.component';
import { FaridabadComponent } from './pages/faridabad/faridabad.component';
import { GuwahatiComponent } from './pages/guwahati/guwahati.component';
import { DrcComponent } from './pages/drc/drc.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'home', component: HomeComponent},
      { path: 'ahmedabad', component: AhmedabadComponent},
      { path: 'bangalore', component: BangaloreComponent},
      { path: 'bhubaneshwar', component: BhubaneshwarComponent},
      { path: 'faridabad', component: FaridabadComponent},
      { path: 'guwahati', component: GuwahatiComponent},
      { path: 'drc', component: DrcComponent},
      // Add more routes like 'settings'
    ],
  },
];
