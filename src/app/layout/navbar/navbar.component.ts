import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  username: string = '';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      // Load user profile first
      const profile = await this.authService.getUserProfile();
      if (profile) {
        // Prefer username, otherwise use firstName + lastName
        if (profile.username) {
          this.username = profile.username;
        } else {
          const firstName = profile.firstName || '';
          const lastName = profile.lastName || '';
          this.username = `${firstName} ${lastName}`.trim() || 'User';
        }
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
