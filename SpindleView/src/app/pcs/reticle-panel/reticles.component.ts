import { Inject, Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';

@Component({
  selector: 'reticles-panel',
  templateUrl: './reticles.component.html',
  styleUrls: ['./reticles.component.less']
})
export class ReticlesComponent implements OnInit {
  private cfg : ConfigurationService;
  public reticlesValue : number = 1;
  public expandPanel : boolean = true;

  constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.cfg = confServe;
      this.expandPanel = this.cfg.globals.IsExpandReticles;
    }

  ngOnInit(): void {
  }

  public updatePanel(how : boolean)
  {
    this.expandPanel = how;
    this.cfg.globals.IsExpandReticles = how;
  }

      // gui pick a mode
  SelButton( who : string)
  {
    if(who == 'm'){
      this.cfg.globals.Reticle = 'blank';
    }
    else if (who == 'w'){
      this.cfg.globals.Reticle = 'grid';
    }
    else if (who == 'd'){
      this.cfg.globals.Reticle = 'circles';
    }
    else if (who == 'r'){
      this.cfg.globals.Reticle = 'cross';
    }
    this.cfg.globalinfo.hasChangedZoom.next(true);  // ping to redraw the reticle
    this.cfg.globalinfo.isGlobalsDirty = true;
  }
}