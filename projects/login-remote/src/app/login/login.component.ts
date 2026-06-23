import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

type Strength = 'Weak' | 'Medium' | 'Strong';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  submitted = false;
  showPassword = false;
  isLoading = false;
  loginError = '';
  readonly form: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get passwordStrength(): Strength {
    const value = this.form.get('password')?.value || '';
    let score = 0;
    if (value.length >= 8) { score++; }
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) { score++; }
    if (/\d/.test(value)) { score++; }
    if (/[^A-Za-z0-9]/.test(value)) { score++; }
    return score >= 4 ? 'Strong' : score >= 2 ? 'Medium' : 'Weak';
  }

  get strengthWidth(): string {
    return this.passwordStrength === 'Strong' ? '100%' : this.passwordStrength === 'Medium' ? '66%' : '33%';
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    this.loginError = '';
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.form.value;

    this.http.post<any>(`${environment.apiUrl}/api/auth/login`, credentials)
      .subscribe(
        (res) => {
          this.isLoading = false;
          // Store token & user information
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // Dispatch custom event to trigger instant header & layout updates in other MFEs
          window.dispatchEvent(new Event('storage-update'));
          window.dispatchEvent(new Event('storage'));

          // Redirect to homepage
          this.router.navigate(['/password']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Login failed:', error);
          this.loginError = error.error?.error || 'Invalid email or password. Please try again.';
        }
      );
  }
}
