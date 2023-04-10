import { Time } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GlobalInfo } from 'src/app/models/globals';
import { Point } from 'src/app/models/smallclasses';
import { ConfigurationService } from 'src/app/services/configuration';
import { DebugUtil } from 'src/app/utility/DebugUtil';
import { ZoomUtil } from 'src/app/utility/ZoomUtil';

@Component({
  selector: 'video-view',
  templateUrl: './videoview.component.html',
  styleUrls: ['./videoview.component.css'],
})

export class VideoViewComponent implements OnInit, OnDestroy  {
  public Filter : string;
  private cfg : ConfigurationService;
    // create member that holds the function reference so we know 'this' on entry
  protected moveEventListener: EventListener;   
  private SaveTime : number;
  public VideoUrl : string = "";
  public rotator : string = "rotate90";

    constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.Filter = '';
      this.cfg = confServe;
      this.moveEventListener = (x : Event) => {this.onMouseMove(x as MouseEvent);}
      this.SaveTime = Date.now();
      if( this.cfg.globals.VideoRotation < 45) {
        this.rotator = 'rotate0';
      }
      else if( this.cfg.globals.VideoRotation < 135) {
        this.rotator = 'rotate90';
      }
      else if( this.cfg.globals.VideoRotation < 225) {
        this.rotator = 'rotate180';
      }
      else {
        this.rotator = 'rotate270';
      }

    }

    ngOnInit()
    {
      // let x = document.getElementById("ImgView");
      // x?.addEventListener('mousemove', this.moveEventListener);
      let x = document.getElementById("ReticleView");
      x?.addEventListener('mousemove', this.moveEventListener);
      this.cfg.globalinfo.hasChangedZoom.subscribe(() => this.SetZoomAmount());
      this.CalcSize();
      this.VideoUrl = this.cfg.globals.VideoUrl;
    }

    OnImgLoaded()
    {
      this.cfg.globalinfo.hasChangedZoom.next(true);  // ping the zoom changer
    }

    ngOnDestroy()
    {
      // let x = document.getElementById("ImgView");
      // x?.removeEventListener('mousemove', this.moveEventListener);
      let x = document.getElementById("ReticleView");
      x?.removeEventListener('mousemove', this.moveEventListener);
      //this.cfg.globalinfo.hasChangedZoom.unsubscribe();
    }

    private onMouseMove = (event: MouseEvent) => {
        let ginfo = this.cfg.globalinfo;
        ginfo.MousePt = ZoomUtil.DisplayToMouse(this.cfg, new Point(event.offsetX, event.offsetY));
        ginfo.hasChangedCoords.next(true);
        // every two seconds check to save globals
        if( this.SaveTime < (Date.now()-2000)) {
          if(ginfo.isGlobalsDirty)
          {
            GlobalInfo.SaveGlobals(this.cfg);
          }
          this.SaveTime = Date.now();
        }
      }
    
    setClickPt(event : MouseEvent) {
      let ginfo = this.cfg.globalinfo;
      // set x and y values
      ginfo.ClickPt = ZoomUtil.DisplayToMouse(this.cfg, new Point(event.offsetX, event.offsetY));
      ginfo.hasChangedCoords.next(true);
      ginfo.hasChangedZoom.next(true);  // move the click spot by redrawing the reticle
        if(event.shiftKey) {
          // also move if shift key is down
        }
      }

      CalcSize() {
        let y = document.getElementById("VideoContainer") as HTMLDivElement;
        let a = document.getElementById("GridContainer") as HTMLDivElement;
        if( y!= null && a != null) {
          y.style.width = (a.scrollWidth-150).toString() + "px";
          y.style.height = a.scrollHeight.toString() + "px";
        }        
      }

      SetZoomAmount()
      {
        DebugUtil.IfConsole("On SetZoomAmount");

        this.CalcSize();
        let z = this.cfg.globals.ZoomAmount;
        let x = document.getElementById("ImgView") as HTMLImageElement;
        if(this.cfg.globals.VideoRotation == 90 || this.cfg.globals.VideoRotation == 270) {
          this.cfg.globals.VideoSize.x = x.naturalHeight;
          this.cfg.globals.VideoSize.y = x.naturalWidth;
        }
        else {
          this.cfg.globals.VideoSize.x = x.naturalWidth;
          this.cfg.globals.VideoSize.y = x.naturalHeight;
        }
        this.cfg.globalinfo.isGlobalsDirty = true;
        if( x != null)
        {
          x.style.width = (z * x.naturalWidth).toString() + "px";
          x.style.height = (z * x.naturalHeight).toString() + "px";
        }
        //x.src = this.cfg.globals.VideoUrl;
      }
  }


