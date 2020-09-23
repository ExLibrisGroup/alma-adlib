import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdlibComponent } from './adlib/adlib.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'adlib', component: AdlibComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
