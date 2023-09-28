import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageComponent } from './pages/front-page/front-page.component';
import { PropertyDlgComponent } from './pages/property-dlg/property-dlg.component';

const routes: Routes = [
  { path: 'front-page', component: FrontPageComponent },
  { path: 'property-page', component: PropertyDlgComponent },
  { path: '', component: FrontPageComponent },
  { path: '*', component: FrontPageComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
