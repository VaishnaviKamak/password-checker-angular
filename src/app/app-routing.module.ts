import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'password', component: AppComponent, canActivate: [AuthGuard] },
  // URLs stay runtime-configurable through each remoteEntry declaration.
  {
    path: 'login',
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        remoteName: 'loginRemote',
        exposedModule: './LoginModule'
      }).then(remote => remote.LoginModule)
  },
  {
    path: 'signup',
    loadChildren: () =>
      loadRemoteModule({
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
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
