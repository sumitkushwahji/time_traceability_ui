import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = keycloakService.isLoggedIn();

  if (!isLoggedIn) {
    router.navigate(['/landing']);
    return false;
  }

  // Check if user has required roles (if specified in route data)
  const requiredRoles = route.data['roles'] as string[];
  
  if (requiredRoles && requiredRoles.length > 0) {
    // Get all roles - realm roles and client roles
    const userRoles = keycloakService.getUserRoles();
    
    // Also check the token for groups
    const token = keycloakService.getKeycloakInstance().tokenParsed;
    const groups = token?.['groups'] || [];
    const realmRoles = token?.realm_access?.roles || [];
    const clientRoles = token?.resource_access?.[keycloakService.getKeycloakInstance().clientId || '']?.roles || [];
    
    // Check in all possible locations
    const allRoles = [...userRoles, ...groups, ...realmRoles, ...clientRoles];
    
    // Case-insensitive role check
    const hasRole = requiredRoles.some((role) =>
      allRoles.some(userRole => userRole.toLowerCase() === role.toLowerCase())
    );

    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
