import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ShellComponent } from './shell/shell.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [AppComponent, ShellComponent, WelcomeComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule, HttpClientModule],
  providers: [AuthGuard],
  bootstrap: [ShellComponent]
})
export class AppModule {}
