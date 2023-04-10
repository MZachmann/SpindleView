import { asLiteral } from '@angular/compiler/src/render3/view/util';
import { Component, Inject } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';

@Component({
  selector: 'side-panel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.less'],
})

export class SidePanelComponent  {
  public Filter : string;
  private cfg : ConfigurationService;

    constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.Filter = '';
      this.cfg = confServe;
    }

    public isPanelVertical() : string {
      return this.cfg.globals.IsIconsVertical ? "block" : "none";
    }

    public isPanelHorizontal() : string {
      return this.cfg.globals.IsIconsVertical ? "none" : "block";
    }

}


