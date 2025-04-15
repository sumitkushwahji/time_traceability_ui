import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone change detection for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide the router with the configured routes
    provideRouter(routes),

    // Provide the client hydration with event replay
    provideClientHydration(withEventReplay()),

    // Import RouterModule for routing
    importProvidersFrom(RouterModule)
  ]
};
