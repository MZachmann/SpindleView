import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { VideoViewComponent } from './pcs/videoview/videoview.component';
import { LocationComponent } from './pcs/location-panel/location.component';
import { SidePanelComponent } from './pcs/sidepanel/sidepanel.component';
import { ZoomsComponent } from './pcs/zoom-panel/zooms.component';
import { ReticlesComponent } from './pcs/reticle-panel/reticles.component';
import { ReticleDrawComponent } from './pcs/reticle-draw/reticle.component';
import { PropertyDlgComponent } from './pages/property-dlg/property-dlg.component';

import { CommService } from './services/communication';
import { ConfigurationService } from './services/configuration';
import { MatSliderModule } from '@angular/material/slider'; 
import { MatDividerModule } from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ActionpanelComponent } from './pcs/action-panel/actionpanel.component';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule }from '@angular/material/button';
import { FrontPageComponent } from './pages/front-page/front-page.component';
import { FormsModule } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
    AppComponent,
    VideoViewComponent,
    LocationComponent,
    SidePanelComponent,
    ZoomsComponent,
    ReticlesComponent,
    ReticleDrawComponent,
    ActionpanelComponent,
    PropertyDlgComponent,
    FrontPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatSliderModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatMenuModule,
    FormsModule
  ],
  providers: [
    CommService,
    ConfigurationService,
    [{provide: APP_BASE_HREF, useValue : '/' }],
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
