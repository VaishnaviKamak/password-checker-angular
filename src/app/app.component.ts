import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  password = '';
  showPassword = false;
  
  currentUser: { name: string; email: string } | null = null;
  token: string | null = null;
  savedHistory: any[] = [];
  
  isSaving = false;
  saveSuccess = false;
  saveError = '';
  private storageListener: any;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    
    // Listen for storage events (e.g. login/logout from remote MFEs)
    this.storageListener = () => {
      this.checkAuthStatus();
    };
    window.addEventListener('storage', this.storageListener);
    
    // Also listen to custom storage events triggered programmatically
    window.addEventListener('storage-update', this.storageListener);
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      window.removeEventListener('storage-update', this.storageListener);
    }
  }

  checkAuthStatus(): void {
    const userJson = localStorage.getItem('user');
    const tokenStr = localStorage.getItem('token');
    
    if (userJson && tokenStr) {
      this.currentUser = JSON.parse(userJson);
      this.token = tokenStr;
      this.loadHistory();
    } else {
      this.currentUser = null;
      this.token = null;
      this.savedHistory = [];
    }
  }

  loadHistory(): void {
    if (!this.token) return;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    this.http.get<any[]>(`${environment.apiUrl}/api/passwords/history`, { headers })
      .subscribe(
        (data) => {
          this.savedHistory = data;
        },
        (error) => {
          console.error('Error loading history:', error);
          if (error.status === 401 || error.status === 403) {
            // Token expired or invalid
            this.logout();
          }
        }
      );
  }

  savePassword(): void {
    if (!this.token || !this.password || this.isSaving) return;

    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      password: this.password,
      score: this.score,
      strength: this.strengthLabel,
      checks: this.checks.map(c => ({
        label: c.label,
        passed: c.test(this.password)
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/api/passwords/save`, body, { headers })
      .subscribe(
        (res) => {
          this.isSaving = false;
          this.saveSuccess = true;
          // Add newly saved record to the top of the history list
          this.savedHistory.unshift(res.record);
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        (error) => {
          this.isSaving = false;
          console.error('Error saving password:', error);
          this.saveError = error.error?.error || 'Failed to save password.';
          setTimeout(() => this.saveError = '', 4000);
        }
      );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.checkAuthStatus();
    // Dispatch event to update ShellComponent navigation
    window.dispatchEvent(new Event('storage'));
    this.router.navigate(['/login']);
  }

  deletePassword(id: string): void {
    if (!this.token || !id) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    this.http.delete(`${environment.apiUrl}/api/passwords/${id}`, { headers })
      .subscribe(
        () => {
          const item = this.savedHistory.find(i => (i.id || i._id) === id);
          if (item) {
            item.isDeleting = true;
          }
          setTimeout(() => {
            this.savedHistory = this.savedHistory.filter(i => (i.id || i._id) !== id);
          }, 300);
        },
        (error) => {
          console.error('Error deleting password:', error);
        }
      );
  }

  readonly checks = [
  { label: '8+ characters',                  test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',               test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',               test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',                         test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character',              test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { label: 'Must not contain @',             test: (p: string) => !/@/.test(p) && p.length > 0 },
  { label: 'Must contain "ironman"',         test: (p: string) => p.toLowerCase().includes('ironman') },
  { label: 'No repeated digits (e.g. 11)',   test: (p: string) => !/(\d)\1/.test(p) },
  { label: 'Must not contain "admin"',       test: (p: string) => !p.toLowerCase().includes('admin') && p.length > 0 },
  { label: 'More than 2 digits',             test: (p: string) => (p.match(/[0-9]/g) || []).length > 2 },
];

  private readonly labels = ['', 'Very Weak', 'Very Weak', 'Weak', 'Weak', 'Fair', 'Fair', 'Good', 'Good', 'Strong', 'Very Strong'];
  private readonly colors = ['#ff3b30','#ff3b30','#ff9500','#ff9500','#ffcc00','#ffcc00','#34c759','#34c759','#30d158','#30d158'];


  get score(): number {
    return this.checks.filter(c => c.test(this.password)).length;
  }
  get strengthLabel(): string { return this.labels[this.score] || ''; }
  get strengthColor(): string { return this.colors[this.score - 1] || this.colors[0]; }

  get strengthPercent(): string {
    return this.password ? `${Math.round((this.score / 10) * 100)}%` : '0%';
  }

  passes(test: (p: string) => boolean): boolean {
    return this.password.length > 0 && test(this.password);
  }
}