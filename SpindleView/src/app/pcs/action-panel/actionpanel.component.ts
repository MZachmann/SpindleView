import { Component, OnInit, Inject } from '@angular/core';
import { CommModel, CommService } from 'src/app/services/communication';
import { ConfigurationService } from 'src/app/services/configuration';
import { ZoomUtil } from 'src/app/utility/ZoomUtil';
import { Point } from 'src/app/models/smallclasses';
import { InchPixels } from 'src/app/models/InchPixels';
import { DebugUtil } from 'src/app/utility/DebugUtil';

// set view encapsulatio none here so we can override the panel padding
@Component({
  selector: 'action-panel',
  templateUrl: './actionpanel.component.html',
  styleUrls: ['./actionpanel.component.less']
})
export class ActionpanelComponent implements OnInit {

  private cfg : ConfigurationService;
  private comm : CommService;
  public TextArea: string = "";

  constructor(@Inject(ConfigurationService) confServe : ConfigurationService, @Inject(CommService) commServe : CommService)
  {
    this.cfg = confServe;
    this.comm = commServe;
 }

  ngOnInit(): void {
    this.TextArea = this.cfg.globals.MaterialHeight.toString();
  }

  OnChangeMaterialHeight()
  {
    let x = parseFloat(this.TextArea);
    if(x != undefined && x != this.cfg.globals.MaterialHeight)
    {
      this.cfg.globals.MaterialHeight = x;
    }
  }

  public static handleResponse(what : ArrayBuffer)
  {
    let x = 12;
  }

  SelButton(who: string)
  {
    switch( who)
    {
      case 'm' :  // move center to click
        {
          let ginfo = this.cfg.globalinfo;
          let nz = ZoomUtil.MouseToMachine(this.cfg, this.cfg.globals.VideoCenter);
          let nx = ZoomUtil.MouseToMachine(this.cfg, ginfo.ClickPt);
          let ptNew = new Point( ginfo.MachinePosn.x + nx.x - nz.x, 
                                ginfo.MachinePosn.y + nx.y - nz.y);
          DebugUtil.IfConsole("Moveto = " + ptNew.x + ';' + ptNew.y);
          ginfo.cncDev.SetMachineXY(this.comm, ptNew);
        }
        break;
      case 'd' :  // place so drill at center point
      {
        let nx = ZoomUtil.MouseToMachine(this.cfg, this.cfg.globals.VideoCenter);
        this.cfg.globalinfo.cncDev.SetMachineXY(this.comm, nx);
      }
      break;
      case 'f' :  // focus
      {
        this.OnChangeMaterialHeight(); // focus?
        let nx = this.cfg.globals.MaterialHeight + this.cfg.globals.FocusHeight;
        this.cfg.globalinfo.cncDev.SetMachineZ(this.comm, nx);
      }
      break;
      default  :
        break;
    }
  }

}
