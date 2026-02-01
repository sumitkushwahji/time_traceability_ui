import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<KeycloakProfile | null> {
    try {
      return await this.keycloakService.loadUserProfile();
    } catch (error) {
      console.error('Failed to load user profile', error);
      return null;
    }
  }

  /**
   * Get username
   */
  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  /**
   * Login
   */
  login(redirectUri?: string): void {
    this.keycloakService.login({
      redirectUri: redirectUri || window.location.origin + '/dashboard'
    });
  }

  /**
   * Logout
   */
  logout(): void {
    this.keycloakService.logout(window.location.origin + '/landing');
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  /**
   * Get access token
   */
  getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }
}
