import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

type Strength = 'Weak' | 'Medium' | 'Strong';

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;
  return password && confirmation && password !== confirmation ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  submitted = false;
  showPassword = false;
  isLoading = false;
  signupSuccess = false;
  signupError = '';
  readonly form: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
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

  get showMismatch(): boolean {
    const confirmation = this.form.get('confirmPassword');
    return !!this.form.errors?.passwordsMismatch && !!confirmation && (confirmation.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    this.signupError = '';
    this.signupSuccess = false;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.form.value;

    this.http.post<any>('http://localhost:5000/api/auth/signup', { name, email, password })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.signupSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        (error) => {
          this.isLoading = false;
          console.error('Signup failed:', error);
          this.signupError = error.error?.error || 'Registration failed. Please try again.';
        }
      );
  }
}
