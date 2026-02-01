import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const rootGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = keycloakService.isLoggedIn();

  if (isLoggedIn) {
    // User is authenticated, go to dashboard
    router.navigate(['/dashboard'], { replaceUrl: true });
  } else {
    // User is not authenticated, go to landing
    router.navigate(['/landing'], { replaceUrl: true });
  }
  
  return false; // Prevent default navigation
};
