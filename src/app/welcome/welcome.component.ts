import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      console.log('[Welcome] User already logged in, redirecting to /password...');
      this.router.navigate(['/password']);
    }
  }

  goToLogin(): void {
    console.log('[Welcome] Navigating to Login Remote micro-frontend (/login)...');
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    console.log('[Welcome] Navigating to Signup Remote micro-frontend (/signup)...');
    this.router.navigate(['/signup']);
  }
}
