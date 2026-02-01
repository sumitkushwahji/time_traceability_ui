import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const profile = await this.authService.getUserProfile();
    if (profile) {
      this.username = profile.username || profile.email || 'User';
    }
  }

  logout() {
    this.authService.logout();
  }

  goBack() {
    this.router.navigate(['/landing']);
  }
}
