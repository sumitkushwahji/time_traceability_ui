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
        this.username = profile.username || profile.firstName || profile.email || 'User';
        console.log('Logged in user:', this.username, profile);
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
