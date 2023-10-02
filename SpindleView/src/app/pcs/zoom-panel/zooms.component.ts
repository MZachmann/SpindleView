import { Inject, Component, OnInit } from '@angular/core';
import { Point } from 'src/app/models/smallclasses';
import { ConfigurationService } from 'src/app/services/configuration';
import { DebugUtil } from 'src/app/utility/DebugUtil';
import { ZoomUtil } from 'src/app/utility/ZoomUtil';

@Component({
  selector: 'zooms-panel',
  templateUrl: './zooms.component.html',
  styleUrls: ['./zooms.component.less']
})

export class ZoomsComponent implements OnInit {
  private cfg : ConfigurationService;
  public ZoomSlider : number = 1;
  public expandPanel : boolean = true;

  constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.cfg = confServe;
      this.updatePanel(this.cfg.globals.IsExpandZoom);
    }

  ngOnInit(): void {
    this.ZoomSlider = this.cfg.globals.ZoomAmount;
  }

  onInputSlider()
  {
    this.onChangeSlider() // it should already be done, but if not...
  }

  onChangeSlider()
  {
    this.cfg.globals.ZoomAmount = this.ZoomSlider;
    this.cfg.globalinfo.hasChangedZoom.next(true);
  }

  public updatePanel(how : boolean)
  {
    this.expandPanel = how;
    this.cfg.globals.IsExpandZoom = how;
  }

  private CleanZoom(zm : number) : number {
    zm = parseFloat(zm.toFixed(2));   // keep only two decimal places
    zm = Math.max(0.25, Math.min(zm, 4));
    return zm;
  }

  ZoomChange(delta : number)
  {
    DebugUtil.IfConsole("On ZoomChange");
    this.ZoomSlider = this.CleanZoom(this.ZoomSlider + delta);
    this.onChangeSlider();
  }

  FormatLabel(value: number | null) : string {
    if (!value) {
      return "0";
    }

    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return String(value);
  }



      // gui pick a mode
  SelButton( who : string)
    {
      if(who == 'm'){
            // center window
            let img = document.getElementById('ImgView') as HTMLImageElement;   // can we get the view window?
            let contain = document.getElementById('VideoContainer') as HTMLImageElement;   // can we get the view window?

            if(img) {
              let ptSize = new Point( img.clientWidth, img.clientHeight);
              let ptWindow = new Point( contain.clientWidth, contain.clientHeight);
              let zm = this.cfg.globals.ZoomAmount;
              let ptA = ZoomUtil.BitmapToMouse(this.cfg, this.cfg.globals.VideoCenter);
              let ptCenter = ZoomUtil.MouseToDisplay(this.cfg, ptA);
              let a: ScrollToOptions = {left: ptCenter.x-ptWindow.x/2, top : ptCenter.y-ptWindow.y/2};
              contain.scrollTo(a);
            }
      }
      else if (who == 'w'){
            // center click window
            let img = document.getElementById('ImgView') as HTMLImageElement;   // can we get the view window?
            let contain = document.getElementById('VideoContainer') as HTMLImageElement;   // can we get the view window?

            if(img && contain) {
              let ptSize = new Point( img.clientWidth, img.clientHeight);
              let ptWindow = new Point( contain.clientWidth, contain.clientHeight);
              let ptCenter = ZoomUtil.MouseToDisplay(this.cfg, this.cfg.globalinfo.ClickPt);
              let a: ScrollToOptions = {left: ptCenter.x-ptWindow.x/2, top : ptCenter.y-ptWindow.y/2};
              contain.scrollTo(a);
            }
      }
      else if (who == 'd'){
          // fit vertical
          let contain = document.getElementById('VideoContainer') as HTMLImageElement;   // can we get the view window?
          let zm = this.CleanZoom(contain.clientHeight / this.cfg.globals.VideoSize.y);
          this.ZoomSlider = zm;
          this.cfg.globals.ZoomAmount = zm;
          this.cfg.globalinfo.hasChangedZoom.next(true);  // ping
          this.cfg.globalinfo.isGlobalsDirty = true;
      }
      else if (who == 'r'){
          // fit horizontal
          let contain = document.getElementById('VideoContainer') as HTMLImageElement;   // can we get the view window?
          let zm = this.CleanZoom(contain.clientWidth / this.cfg.globals.VideoSize.x);
          this.ZoomSlider = zm;
          this.cfg.globals.ZoomAmount = zm;
          this.cfg.globalinfo.hasChangedZoom.next(true);  // ping
          this.cfg.globalinfo.isGlobalsDirty = true;
        }
//      this.SetMeasureMode();
    }

}
