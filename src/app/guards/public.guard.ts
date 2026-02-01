import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const publicGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  // Check if we're in the middle of a Keycloak redirect
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code') || urlParams.has('state') || urlParams.has('session_state')) {
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }

  // Allow access to landing page regardless of login status
  // This allows unauthorized users to access landing page where they can logout
  return true;
};
