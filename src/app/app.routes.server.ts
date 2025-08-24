import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes that can be prerendered safely
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // Disable prerendering for routes that make API calls
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'home',
    renderMode: RenderMode.Server
  },
  {
    path: 'ahmedabad/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'bangalore/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'bhubaneshwar/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'faridabad/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'guwahati/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'drc/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'shared/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'file-upload-stats',
    renderMode: RenderMode.Server
  },
  // Fallback for any other routes
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
