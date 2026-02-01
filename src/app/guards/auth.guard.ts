import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = await keycloakService.isLoggedIn();

  if (!isLoggedIn) {
    await keycloakService.login({
      redirectUri: window.location.origin + state.url,
    });
    return false;
  }

  // Check if user has required roles (if specified in route data)
  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((role) =>
      keycloakService.isUserInRole(role)
    );

    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
