import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter, RouterModule } from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../environments/environment';

function initializeKeycloak(keycloak: KeycloakService, platformId: Object) {
  return () => {
    // Only initialize Keycloak in the browser
    if (isPlatformBrowser(platformId)) {
      return keycloak.init({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId,
        },
        initOptions: {
          onLoad: 'check-sso',
          checkLoginIframe: false,
          redirectUri: window.location.origin + '/dashboard',
        },
      }).then((authenticated: boolean) => {
        return authenticated;
      }).catch((error: any) => {
        console.error('Keycloak initialization failed', error);
        throw error;
      });
    }
    
    // Return resolved promise for SSR
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone change detection for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide the router with the configured routes
    provideRouter(routes),

    // Provide the client hydration with event replay
    provideClientHydration(withEventReplay()),

    // Import RouterModule for routing
    importProvidersFrom(RouterModule),

    // Enable the HttpClient to use the fetch API for SSR compatibility
    provideHttpClient(withFetch()),

    // Keycloak service
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, PLATFORM_ID],
    },
  ],
};
