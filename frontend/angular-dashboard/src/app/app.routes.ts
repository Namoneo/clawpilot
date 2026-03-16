import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'agents', 
    loadComponent: () => import('./pages/agents/agents.component').then(m => m.AgentsComponent) 
  },
  { 
    path: 'templates', 
    loadComponent: () => import('./pages/templates/templates.component').then(m => m.TemplatesComponent) 
  },
  { 
    path: 'logs', 
    loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent) 
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) 
  },
];
