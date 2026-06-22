import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent {
  constructor(private readonly router: Router) {}

  get currentUser(): { name: string; email: string } | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Dispatch custom storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
