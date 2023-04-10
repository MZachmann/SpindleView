import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';
import { Measurement } from 'src/app/models/smallclasses';
import { Point } from 'src/app/models/smallclasses';
import { ZoomUtil } from 'src/app/utility/ZoomUtil';
import { PosReader } from 'src/app/utility/PosReader';
import { GlobalInfo } from 'src/app/models/globals';

@Component({
  selector: 'locate-panel',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.less'],
  encapsulation:ViewEncapsulation.None
})

export class LocationComponent  {
  public Filter : string;
  public PosnX : string;
  public PosnY : string;
  public PosnZ : string;
  public PosnA : string;
  public PosnB : string;
  public MeasureMode : string = "";
  public ShowHints : boolean;
  public expandedPanel : boolean = true;
  private cfg : ConfigurationService;

    constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.cfg = confServe;
      this.Filter = '';
      this.PosnX = '0';
      this.PosnY = '0';
      this.PosnZ = '0';
      this.PosnA = '0';
      this.PosnB = '0';
      this.ShowHints = confServe.globals.IsShowHints;
      this.UpdateValues();
      this.SetMeasureMode();
      this.updatePanel( this.cfg.globals.IsExpandLoc);
    }

    ngOnInit()
    {
      this.cfg.globalinfo.hasChangedCoords.subscribe(() => this.UpdateValues());
    }

    ngOnDestroy()
    {
      //this.cfg.globalinfo.hasChangedCoords.unsubscribe();
    }

    public updatePanel(how : boolean)
    {
      this.expandedPanel = how;
      this.cfg.globals.IsExpandLoc = how;
    }

    SetMeasureMode()
    {
      switch( this.cfg.globals?.MeasureMode)
      {
        case Measurement.Distance : this.MeasureMode = "Distance";
          break;
        case Measurement.LengthAngle : this.MeasureMode = "Vector";
          break;
        case Measurement.Machine : this.MeasureMode = "Machine";
          break;
        case Measurement.Workspace : this.MeasureMode = "Workspace";
         break;
        case undefined :
          break;
      }
    }

      // gui pick a mode
      SelButton( who : string)
    {
      if(who == 'm'){
        this.cfg.globals.MeasureMode = Measurement.Machine;
      }
      else if (who == 'w'){
        this.cfg.globals.MeasureMode = Measurement.Workspace;
      }
      else if (who == 'd'){
        this.cfg.globals.MeasureMode = Measurement.Distance;
      }
      else if (who == 'r'){
        this.cfg.globals.MeasureMode = Measurement.LengthAngle;
      }
      this.SetMeasureMode();
      this.cfg.globalinfo.isGlobalsDirty = true;
    }

    UpdateValues()
    {
      // this gets called whenever the hasChangedCoords is poked
      // poll the actual CNC device instance at most every PollingTime
      this.cfg.globalinfo.posReader?.ReadPositions(GlobalInfo.PollingTime);

      let suffix = '\" ';
      switch( this.cfg.globals.MeasureMode) {
        case Measurement.Distance :
          {
            let glob = this.cfg.globals;
            let ginfo = this.cfg.globalinfo;
            let ptV = ZoomUtil.BitmapToMouse(this.cfg, glob.VideoCenter);
            let nx = ZoomUtil.MouseToWorkspace(this.cfg, ptV);
            this.PosnA = nx.x.toFixed(3) + suffix + 'X';
            this.PosnB = nx.y.toFixed(3) + suffix + 'Y';
            let ptM = ZoomUtil.MouseToWorkspace(this.cfg, ginfo.MousePt);
            let dx = ptM.x - nx.x;
            let dy = ptM.y - nx.y;
            this.PosnX = dx.toFixed(3) + suffix + 'X';
            this.PosnY = dy.toFixed(3) + suffix + 'Y';
            this.PosnZ = this.cfg.globalinfo.WorkspacePosn.z.toFixed(3) + suffix + 'Z';
          }
          break;
        case Measurement.LengthAngle :
          {
            let anglesuffix = '°';
            let glob = this.cfg.globals;
            let ginfo = this.cfg.globalinfo;
            let ptV = ZoomUtil.BitmapToMouse(this.cfg, glob.VideoCenter);
            let nx = ZoomUtil.MouseToWorkspace(this.cfg, ptV);
            this.PosnA = nx.x.toFixed(3) + suffix + 'X';
            this.PosnB = nx.y.toFixed(3) + suffix + 'Y';
            let ptM = ZoomUtil.MouseToWorkspace(this.cfg, ginfo.MousePt);
            let dx = ptM.x - nx.x;
            let dy = ptM.y - nx.y;
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            this.PosnX = Math.sqrt(dx*dx + dy*dy).toFixed(3) + suffix + 'L';
            this.PosnY = angle.toFixed(3) + anglesuffix + 'A';
            this.PosnZ = ginfo.WorkspacePosn.z.toFixed(3) + suffix + 'Z';
          }
          break;
        case Measurement.Machine :
          {
            let nx = ZoomUtil.MouseToMachine(this.cfg, this.cfg.globalinfo.MousePt);
            this.PosnX = nx.x.toFixed(3) + suffix + 'X';
            this.PosnY = nx.y.toFixed(3) + suffix + 'Y';
            let ptV = ZoomUtil.BitmapToMouse(this.cfg, this.cfg.globals.VideoCenter);
            nx = ZoomUtil.MouseToMachine(this.cfg, ptV);
            this.PosnA = nx.x.toFixed(3) + suffix + 'X';
            this.PosnB = nx.y.toFixed(3) + suffix + 'Y';
            this.PosnZ = this.cfg.globalinfo.MachinePosn.z.toFixed(3) + suffix + 'Z';
          }
            break;
        default:
        case Measurement.Workspace :
          {
            let nx = ZoomUtil.MouseToWorkspace(this.cfg, this.cfg.globalinfo.MousePt);
            this.PosnX = nx.x.toFixed(3) + suffix + 'X';
            this.PosnY = nx.y.toFixed(3) + suffix + 'Y';
            let ptV = ZoomUtil.BitmapToMouse(this.cfg, this.cfg.globals.VideoCenter);
            nx = ZoomUtil.MouseToWorkspace(this.cfg, ptV);
            this.PosnA = nx.x.toFixed(3) + suffix + 'X';
            this.PosnB = nx.y.toFixed(3) + suffix + 'Y';
            this.PosnZ = this.cfg.globalinfo.WorkspacePosn.z.toFixed(3) + suffix + 'Z';
          }
            break;
      }
    }


  }


