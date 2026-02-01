import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  isLoggedIn: boolean = false;
  checking: boolean = true;
  currentYear: number = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if we're in the middle of a Keycloak redirect (has code or state params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('state') || urlParams.has('session_state')) {
      // Keycloak is processing authentication, redirect to dashboard
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return;
    }

    // Check login status but allow both logged in and logged out users to view landing page
    this.isLoggedIn = this.authService.isLoggedIn();
    this.checking = false;
  }

  login() {
    // Redirect to dashboard after login
    this.authService.login(window.location.origin + '/dashboard');
  }

  signup() {
    // Redirect to Keycloak registration page
    const keycloakUrl = 'https://bharatsamay.org/auth';
    const realm = 'npl-realm';
    const clientId = 'frontend';
    const redirectUri = window.location.origin + '/dashboard';
    window.location.href = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
