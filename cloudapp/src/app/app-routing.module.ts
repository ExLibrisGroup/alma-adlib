import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdlibComponent } from './adlib/adlib.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { MainComponent, MainGuard } from './main/main.component';
import { NoConfigErrorComponent } from './static/errors.component';

const routes: Routes = [
  { path: '', component: MainComponent, canActivate: [MainGuard] },
  { path: 'adlib', component: AdlibComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'errors/noconfig', component: NoConfigErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
