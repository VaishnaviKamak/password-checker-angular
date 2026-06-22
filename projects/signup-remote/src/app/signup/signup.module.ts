import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup.component';

const routes: Routes = [{ path: '', component: SignupComponent }];

@NgModule({
  declarations: [SignupComponent],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule.forChild(routes)]
})
export class SignupModule {}
