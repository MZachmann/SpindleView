import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';
import { DrawReticle } from 'src/app/utility/DrawReticle';


export interface ReticleDrawer
{
    Name : string; 
    redraw(dest : HTMLCanvasElement) : void;
}

@Component({
  selector: 'reticle-view',
  templateUrl: './reticle.component.html',
  styleUrls: ['./reticle.component.less']
})
export class ReticleDrawComponent implements OnInit, OnDestroy {

  private cfg : ConfigurationService;
  private drawreticle : DrawReticle;

  constructor(@Inject(ConfigurationService) confServe : ConfigurationService) { 
    this.cfg = confServe;
    this.drawreticle = new DrawReticle(this.cfg);
  }

  ngOnInit(): void {
    this.cfg.globalinfo.hasChangedZoom.subscribe(() => this.SetZoomAmount());

//    this.SetZoomAmount();
    let u = document.getElementById("reticle") as HTMLCanvasElement;
    if( u != null) {
      this.drawreticle.Redraw(u);
    }
  }

  ngOnDestroy()
  {
    // this.cfg.globalinfo.hasChangedZoom.unsubscribe();
  }

  // when zoom changes, resize the reticle and redraw it
  SetZoomAmount()
  {
    let z = this.cfg.globals.ZoomAmount;
    let x = document.getElementById("reticle") as HTMLCanvasElement;
    if( x != null)
    {
      // x.style.width = (z * this.cfg.globals.VideoSize.x).toString() + "px";
      // x.style.height = (z * this.cfg.globals.VideoSize.y).toString() + "px";
      this.drawreticle.Redraw(x);
    }
  }

}

