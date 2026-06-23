import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from './guards/auth.guard';

import { environment } from 'src/environments/environment';

const isProduction = environment.production;

const loginRemoteEntry = isProduction
  ? '/login-remote/remoteEntry.js'
  : 'http://localhost:4201/remoteEntry.js';

const signupRemoteEntry = isProduction
  ? '/signup-remote/remoteEntry.js'
  : 'http://localhost:4202/remoteEntry.js';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'password', component: AppComponent, canActivate: [AuthGuard] },
  {
    path: 'login',
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: loginRemoteEntry,
        remoteName: 'loginRemote',
        exposedModule: './LoginModule'
      }).then(remote => remote.LoginModule)
  },
  {
    path: 'signup',
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: signupRemoteEntry,
        remoteName: 'signupRemote',
        exposedModule: './SignupModule'
      }).then(remote => remote.SignupModule)
  },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
