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
  private isRightDown : boolean = false;
  private lastRight : Point = new Point(0,0);
    // create member that holds the function reference so we know 'this' on entry
  protected moveEventListener: EventListener;   
  protected resizeEventListener: EventListener;   
  private SaveTime : number;
  public VideoUrl : string = "";
  public rotator : string = "rotate90";

    constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
    {
      this.Filter = '';
      this.cfg = confServe;
      this.moveEventListener = (x : Event) => {this.onMouseMove(x as MouseEvent);}
      this.resizeEventListener = (x : Event) => {this.RecalcSize();}
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
      if(x) {
        x?.addEventListener('mousemove', this.moveEventListener);
        DebugUtil.IfConsole("Attach move");
      }
    
      // let y = document.getElementById("GridContainer");
      // if(y)
      {
        window.addEventListener('resize', this.resizeEventListener);
        DebugUtil.IfConsole("Attach resize");
      }

      this.cfg.globalinfo.hasChangedZoom.subscribe(() => this.SetZoomAmount());
      this.CalcSize();
      this.VideoUrl = this.cfg.globals.VideoUrl;
    }

    OnImgLoaded()
    {
      DebugUtil.IfConsole("image loaded");
      this.cfg.globalinfo.hasChangedZoom.next(true);  // ping the zoom changer
      setTimeout(() => {
        // Code to be executed after the delay
        this.cfg.globalinfo.hasChangedZoom.next(true);  // ping the zoom changer
        this.cfg.globalinfo.hasChangedCoords.next(true);  // move the click spot by redrawing the reticle
      }, 2000 );
    }

    ngOnDestroy()
    {
      let x = document.getElementById("ReticleView");
      x?.removeEventListener('mousemove', this.moveEventListener);

      window.removeEventListener('resize', this.resizeEventListener);
      //this.cfg.globalinfo.hasChangedZoom.unsubscribe();
    }

    private onMouseMove = (event: MouseEvent) => {
        let ginfo = this.cfg.globalinfo;
        ginfo.MousePt = ZoomUtil.DisplayToMouse(this.cfg, new Point(event.offsetX, event.offsetY));
        ginfo.hasChangedCoords.next(true);
        let didPing = (event.buttons & 2) || ((event.buttons & 1) && event.shiftKey);
        if (didPing) {
          if (this.isRightDown) {
            let xo = - this.cfg.globals.ZoomAmount * (ginfo.MousePt.x - this.lastRight.x);
            let yo = this.cfg.globals.ZoomAmount * (ginfo.MousePt.y - this.lastRight.y);
            if ( xo > 10 || yo > 10 || xo < -10 || yo < -10) {
              let wdw = document.getElementById("VideoContainer") as HTMLImageElement;
              if (wdw != null) {
                wdw.scrollBy(xo, yo);
                //DebugUtil.IfConsole("scroll by " + xo + " . " + yo);
                this.lastRight = ginfo.MousePt;
              }
            }
          }

          this.isRightDown = true;
        }
        else {
          this.isRightDown = false;
        }
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
      }
      
      RecalcSize() {
        DebugUtil.IfConsole("resizing window")
        this.CalcSize()
      }
      
      CalcSize() {
        let y = document.getElementById("VideoContainer") as HTMLDivElement;
        let a = document.getElementById("GridContainer") as HTMLDivElement;
        if( y!= null && a != null) {
          let u = document.getElementById("side_panel");
          let clw = 0;
          if(u) {
            clw = u?.offsetWidth ?? 0;
            DebugUtil.IfConsole("calc side width")
          }
          // don't be larger than the actual data
          let ywidth = (a.clientWidth - clw);
          let yheight = (a.clientHeight);
          let z = this.cfg.globals.ZoomAmount;
          let gl = this.cfg.globals.VideoSize;
          if(gl.x > 0 && gl.y > 0) {
            ywidth = Math.min(z*gl.x, ywidth);
            yheight = Math.min(z*gl.y, yheight);
          }
          // remove scroll bar dimensions if img fills window
          let iv = document.getElementById("ImgView");
          if(iv && iv.offsetHeight > 0 && iv.offsetWidth > 0) {
            if(z*gl.x > ywidth) {
              ywidth -= iv.offsetWidth - iv.clientWidth;
            }
            if(z*gl.y > yheight) {
              yheight -= iv.offsetHeight - iv.clientHeight;
            }
          }
          
          y.style.width = (1+ywidth).toString() + "px";
          y.style.height = (1+yheight).toString() + "px";
          DebugUtil.IfConsole("Resize to: " + y.style.width + "." + y.style.height);
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


