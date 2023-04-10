import { ConfigurationService } from "../services/configuration";
import { Inject } from "@angular/core";
import { ColorToHtml, Point, PointUtil } from "../models/smallclasses";
import { ReticleDrawer } from "../pcs/reticle-draw/reticle.component";
import { Units } from "../models/smallclasses";
import { ZoomUtil } from "./ZoomUtil";


class Drawx {
    static DrawLine(dest: CanvasRenderingContext2D, cSize: Point, startx: number, starty: number, endx : number, endy : number)
    {
        let xa = Math.max( Math.min(startx, cSize.x), 0);
        let ya = Math.max( Math.min(starty, cSize.y), 0);
        dest.moveTo(xa, ya);
        let wa = Math.max( Math.min(endx, cSize.x), 0);
        let za = Math.max( Math.min(endy, cSize.y), 0);
        dest.lineTo(wa, za);
        //console.log("Lineto " + xa + "," + ya + " :: " + wa + "," + za);
    }

    static DrawCenterCross( dest: CanvasRenderingContext2D, cSize: Point, centerX : number, centerY : number, colors : string)
    {
            dest.beginPath();
            dest.lineWidth = 1;
            dest.strokeStyle = colors;
            let crossSize = 50.0;
            let crossFat = crossSize / 2;
            Drawx.DrawLine(dest, cSize,centerX - crossFat, centerY, centerX + crossFat, centerY);
            Drawx.DrawLine(dest, cSize,centerX, centerY - crossFat, centerX, centerY + crossFat);
            dest.stroke();
    }
}

export class DrawReticle
{
    private reticle : ReticleDrawer;
    private cfg : ConfigurationService;
    private retype : string;

    constructor(confServe : ConfigurationService)
    {
        this.cfg = confServe;
        this.reticle = new DrawRuler(this.cfg);
        this.retype = "cross";
    }

    public Redraw(dest : HTMLCanvasElement)
    {
        if( this.cfg.globals.Reticle != this.retype)
        {
            switch( this.cfg.globals.Reticle)
            {
                case 'cross' :
                {
                    this.reticle = new DrawRuler(this.cfg);
                }
                break;
                case 'grid' :
                    {
                        this.reticle = new DrawCrosshair(this.cfg);
                    }
                    break;
                case 'blank' :
                    {
                        this.reticle = new DrawBlank(this.cfg);
                    }
                    break;
                case 'circles' :
                    {
                        this.reticle = new DrawCircles(this.cfg);
                    }
                    break;
                default :
                {
                    this.reticle = new DrawBlank(this.cfg);
                }
                break;
            }
            this.retype = this.cfg.globals.Reticle;
        }
    this.reticle.redraw(dest);
    }
}

class DrawBase
{
         // round this pixel value to 1/4 1/2 1 inches...
         public static GetOptimalDistance(vres:number,  inPixels : number, unit: Units)
         {
             let lineDistance = inPixels;
             // get # of pixels per line
             if (unit == Units.Inch)
             {
                let sixteenth = vres / 16.0;     // pixels in 1/16 inch
                lineDistance = sixteenth;            // 1/16th of an inch
             }
             return lineDistance;
         }
   
}

class DrawBlank implements ReticleDrawer
{
    public Name : string = "blank";     // yep
    private cfg : ConfigurationService;

    constructor(confServe : ConfigurationService)
    {
        this.cfg = confServe;
    }    

    redraw(dest: HTMLCanvasElement): void {
        let ctx = dest.getContext('2d');
        if(ctx == null)
            return;

        let zoom = this.cfg.globals.ZoomAmount;
        let w = this.cfg.globals.VideoSize.x * zoom;
        let h = this.cfg.globals.VideoSize.y * zoom;
        dest.height = w;
        dest.width = h;
        ctx.clearRect(0, 0, w, h);
    }
}

class DrawCircles implements ReticleDrawer
{
    public Name : string = "circles";     // yep
    private cfg : ConfigurationService;
    private crossSize : number = 50.0;
    private crossFat : number = this.crossSize / 2;
    private center : Point = new Point(0,0);
    private CSize : Point = new Point(0,0);

    private lineLength : number = 40;

    private lineDistance : number = 123; // Globals.Instance.VideoResolution / 16.0; //  GetOptimalDistance(100, Unit);

    constructor(confServe : ConfigurationService)
    {
        this.cfg = confServe;
    }    

    redraw(dest : HTMLCanvasElement) : void {
        let ctx = dest.getContext('2d');
        if(ctx == null)
            return;

        let glob = this.cfg.globals;
        let zoom = glob.ZoomAmount;

        let ptV = ZoomUtil.BitmapToMouse(this.cfg, glob.VideoCenter);
        this.center = ZoomUtil.MouseToDisplay(this.cfg, ptV);
        let w = glob.VideoSize.x * zoom;
        let h = glob.VideoSize.y * zoom;
        dest.height = h;
        dest.width = w;
        this.CSize.x = w; // w;
        this.CSize.y = h; // h;
        ctx.clearRect(0,0,dest.height, dest.width);
        // **********************************
        this.drawit(ctx);
        let ptM = ZoomUtil.MouseToDisplay(this.cfg, ptV);
        Drawx.DrawCenterCross(ctx, this.CSize, ptM.x, ptM.y, ColorToHtml(glob.ReticleTargetColor));
        ptM = ZoomUtil.MouseToDisplay(this.cfg, this.cfg.globalinfo.ClickPt);
        Drawx.DrawCenterCross(ctx, this.CSize, ptM.x, ptM.y, ColorToHtml(glob.ReticleTargetColor));
    }

    // draw the horizontal and vertical ruler lines
    drawit(dest : CanvasRenderingContext2D) : void
    {
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineColor);
        dest.lineWidth = 1;

        let zoom = this.cfg.globals.ZoomAmount;
        // draw crosshair
        let spacing = this.cfg.globals.VideoResolution * zoom / 8;
        for( let i = 1; i<100; i++)
        {
            let endp = i * spacing;
            if(endp > this.CSize.x && endp > this.CSize.y)
                break;
            if(0 != i % 8) {
                dest.beginPath();
                dest.arc(this.center.x, this.center.y, endp, 0, 2 * Math.PI);
                dest.stroke();
                }
        }
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineAccentColor);
        dest.lineWidth = 2;
        for( let i = 8; i<100; i += 8)
        {
            let endp = i * spacing;
            if(endp > this.CSize.x && endp > this.CSize.y)
                break;
            dest.beginPath();
            dest.arc(this.center.x, this.center.y, endp, 0, 2 * Math.PI);
            dest.stroke();
        }
    }
}


class DrawRuler implements ReticleDrawer
{
    public Name : string = "ruler";     // yep
    private cfg : ConfigurationService;
    private crossSize : number = 50.0;
    private crossFat : number = this.crossSize / 2;
    private center : Point = new Point(0,0);
    private CSize : Point = new Point(0,0);

    private lineLength : number = 40;

    private lineDistance : number = 123; // Globals.Instance.VideoResolution / 16.0; //  GetOptimalDistance(100, Unit);

    constructor(confServe : ConfigurationService)
    {
        this.cfg = confServe;
    }    

    redraw(dest : HTMLCanvasElement) : void {
        let ctx = dest.getContext('2d');
        if(ctx == null)
            return;

        let glob = this.cfg.globals;
        let zoom = glob.ZoomAmount;
        let w = glob.VideoSize.x * zoom;
        let h = glob.VideoSize.y * zoom;
        dest.height = h;
        dest.width = w;
        this.CSize.x = w; // w;
        this.CSize.y = h; // h;
        ctx.clearRect(0,0,dest.height, dest.width);
        // **********************************
        let ptV = ZoomUtil.BitmapToMouse(this.cfg, glob.VideoCenter);
        this.center = ZoomUtil.MouseToDisplay(this.cfg, ptV);
        this.drawit(ctx);
        let ptM = ZoomUtil.MouseToDisplay(this.cfg, this.cfg.globalinfo.ClickPt);
        Drawx.DrawCenterCross(ctx, this.CSize, ptM.x, ptM.y, ColorToHtml(glob.ReticleTargetColor));
    }

    // draw the horizontal and vertical ruler lines
    drawit(dest : CanvasRenderingContext2D) : void
    {
        // dest.fillStyle = 'red';
        // dest.fillRect(0,0,this.CSize.x/12, this.CSize.y/12);
        // dest.fillStyle = 'blue';
        // dest.fillRect(this.CSize.x/12, this.CSize.y/12,this.CSize.x, this.CSize.y);
        dest.beginPath();
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineColor);
        dest.lineWidth = 1;
        // draw crosshair
        Drawx.DrawLine(dest, this.CSize,this.center.x, 0, this.center.x, this.center.y - this.crossSize);
        Drawx.DrawLine(dest, this.CSize,this.center.x, this.CSize.y, this.center.x, this.center.y - this.crossSize);
        Drawx.DrawLine(dest, this.CSize,0, this.center.y, this.center.x - this.crossSize, this.center.y);
        // dest.stroke();
        // return;

        Drawx.DrawLine(dest, this.CSize,this.center.x + this.crossSize, this.center.y, this.CSize.x, this.center.y);

        // draw vert lines
        let dot = 0;
        let lineDistance = this.cfg.globals.ZoomAmount * this.cfg.globals.VideoResolution / 16.0;
        let dStart = this.center.x - Math.floor(this.center.x / lineDistance) * lineDistance;   // the first spot such that we go through the center
        for (dot = dStart; dot < this.CSize.x; dot += lineDistance)
        {
            if (Math.abs(dot - this.center.x) > lineDistance / 3)
            {
                this.lineLength = this.GetLineLength(dot - this.center.x);
                // for 1/2 and 1 use blue lines
                var offCount = Math.round(Math.abs(dot - this.center.x) / lineDistance);
                if(offCount == 8 || offCount == 16)
                {
                    // color blue?
                    dest.stroke();
                    dest.beginPath();
                    dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineAccentColor);
                    Drawx.DrawLine(dest, this.CSize,dot, this.center.y - this.lineLength, dot, this.center.y + this.lineLength);
                    dest.stroke();
                    dest.beginPath();
                    dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineColor);
                }
                else
                {
                    Drawx.DrawLine(dest, this.CSize,dot, this.center.y - this.lineLength, dot, this.center.y + this.lineLength);
                }
            }
        }

        // draw horz lines
        dStart = this.center.y - Math.floor(this.center.y / lineDistance) * lineDistance;   // the first spot such that we go through the center
        for (dot = dStart; dot < this.CSize.y; dot += lineDistance)
        {
            if (Math.abs(dot - this.center.y) > lineDistance / 3)
            {
                this.lineLength = this.GetLineLength(dot - this.center.y);
                var offCount = Math.round(Math.abs(dot - this.center.y) / lineDistance);
                if (offCount == 8 || offCount == 16)
                {
                    dest.stroke();
                    dest.beginPath();
                    dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineAccentColor);
                    Drawx.DrawLine(dest, this.CSize,this.center.x - this.lineLength, dot, this.center.x + this.lineLength, dot);
                    dest.stroke();
                    dest.beginPath();
                    dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineColor);
                }
                else
                {
                    Drawx.DrawLine(dest, this.CSize,this.center.x - this.lineLength, dot, this.center.x + this.lineLength, dot);
                }
            }
        }
        dest.stroke();
        dest.beginPath();
        // draw the box and 4 lines at it
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleTargetColor);
        dest.rect(this.center.x - this.crossFat, this.center.y - this.crossFat, this.crossSize, this.crossSize);
        dest.stroke();
        dest.beginPath();
        Drawx.DrawLine(dest, this.CSize,this.center.x, this.center.y - this.crossSize, this.center.x, this.center.y - this.crossFat);
        Drawx.DrawLine(dest, this.CSize,this.center.x, this.center.y + this.crossSize, this.center.x, this.center.y + this.crossFat);
        Drawx.DrawLine(dest, this.CSize,this.center.x - this.crossSize, this.center.y, this.center.x - this.crossFat, this.center.y);
        Drawx.DrawLine(dest, this.CSize,this.center.x + this.crossSize, this.center.y, this.center.x + this.crossFat, this.center.y);
        dest.stroke();
}

private GetLineLength(offset : number) : number
{
    let sixLength = Math.min(40, Math.min(this.CSize.x, this.CSize.y)/40);
    let lineDraw = 0.0;
    let lineDistance = this.cfg.globals.ZoomAmount * this.cfg.globals.VideoResolution / 16.0;                       //  size of 16th of an inch
    let delta = Math.floor(.01 + Math.round(Math.abs(offset / lineDistance)));     // # of 16ths of an inch
    if (0 == delta % 16)     // inches
    {
        lineDraw = 4 * sixLength;
    }
    else if (0 == delta % 8)     // halves
    {
        lineDraw = 2 * sixLength;
    }
    else if (0 == delta % 4)     // halves
    {
        lineDraw = 1.5 * sixLength;
    }
    else
    {
        lineDraw = sixLength;
    }
    return lineDraw;
}
}

class DrawCrosshair  implements ReticleDrawer
{
    public Name : string = "cross";     // yep
    private cfg : ConfigurationService;
    private crossSize : number = 50.0;
    private crossFat : number = this.crossSize / 2;
    private center : Point = new Point(0,0);
    private CSize : Point = new Point(0,0);

    private lineLength : number = 40;

    constructor(confServe : ConfigurationService)
    {
        this.cfg = confServe;
    }    

    redraw(dest : HTMLCanvasElement) : void {
        let ctx = dest.getContext('2d');
        if(ctx == null)
            return;

        let glob = this.cfg.globals;
        let zoom = glob.ZoomAmount;
        let w = glob.VideoSize.x * zoom;
        let h = glob.VideoSize.y * zoom;
        dest.height = h;
        dest.width = w;
        this.CSize.x = w; // w;
        this.CSize.y = h; // h;
        ctx.clearRect(0,0,dest.height, dest.width);
        // **********************************
        let ptV = ZoomUtil.BitmapToMouse(this.cfg, glob.VideoCenter);
        this.center = ZoomUtil.MouseToDisplay(this.cfg, ptV);
        this.drawit(ctx);
        let ptM = ZoomUtil.MouseToDisplay(this.cfg, this.cfg.globalinfo.ClickPt);
        Drawx.DrawCenterCross(ctx, this.CSize, ptM.x, ptM.y, ColorToHtml(this.cfg.globals.ReticleTargetColor));
    }

    GetHalfInch() : number
    {
        return this.cfg.globals.VideoResolution / 2;
    }

    drawit(dest: CanvasRenderingContext2D) : void
    {
        dest.beginPath();
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineColor);
        dest.lineWidth = .5;

       let lineDistance = DrawBase.GetOptimalDistance(this.cfg.globals.VideoResolution, 100, Units.Inch);
        // draw vert lines
         let dot : number;
         let dStart = this.center.x - Math.floor(this.center.x / lineDistance) * lineDistance;   // the first spot such that we go through the center
         for (dot = dStart; dot < this.CSize.x; dot += lineDistance)
         {
             if (Math.abs(dot - this.center.x) > lineDistance / 3)
             {
                 Drawx.DrawLine(dest, this.CSize,dot, 0, dot, this.CSize.y);
             }
             else
             {
                Drawx.DrawLine(dest, this.CSize,dot, 0, dot, this.center.y-this.crossSize);
             }
         }

         // draw horz lines
         dStart = this.center.y - Math.floor(this.center.y / lineDistance) * lineDistance;   // the first spot such that we go through the center
         for (dot = dStart; dot < this.CSize.y; dot += lineDistance)
         {
             if (Math.abs(dot - this.center.y) > lineDistance / 3)
             {
                 Drawx.DrawLine(dest, this.CSize,0, dot, this.CSize.x, dot);
             }
             else
             {
                Drawx.DrawLine(dest, this.CSize,0, dot, this.center.x - this.crossSize, dot);
                Drawx.DrawLine(dest, this.CSize,this.center.x + this.crossSize, dot, this.CSize.x, dot);
             }
         }

        dest.stroke();  // first color done

         dest.beginPath();
         dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleLineAccentColor);
         dest.lineWidth = 1;

         // draw vert lines
         let inchDistance  = this.GetHalfInch();
         dStart = this.center.x - Math.floor(this.center.x / inchDistance) * inchDistance;   // the first spot such that we go through the center
         for (dot = dStart; dot < this.CSize.x; dot += inchDistance)
         {
             if (Math.abs(dot - this.center.x) > lineDistance / 3)
             {
                Drawx.DrawLine(dest, this.CSize,dot, 0, dot, this.CSize.y);
             }
             else
             {
                Drawx.DrawLine(dest, this.CSize,dot, 0, dot, this.center.y - this.crossSize);
                Drawx.DrawLine(dest, this.CSize,dot, this.center.y + this.crossSize, dot, this.CSize.y);
             }
         }

         // draw horz lines
         dStart = this.center.y - Math.floor(this.center.y / inchDistance) * inchDistance;   // the first spot such that we go through the center
         for (dot = dStart; dot < this.CSize.y; dot += inchDistance)
         {
             if (Math.abs(dot - this.center.y) > lineDistance / 3)
             {
                Drawx.DrawLine(dest, this.CSize,0, dot, this.CSize.x, dot);
             }
             else
             {
                Drawx.DrawLine(dest, this.CSize,0, dot, this.center.x - this.crossSize, dot);
                Drawx.DrawLine(dest, this.CSize,this.center.x + this.crossSize, dot, this.CSize.x, dot);
             }
         }

         dest.stroke();
        // draw the box and 4 lines at it
        dest.beginPath();
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleTargetColor);
        dest.rect(this.center.x - this.crossFat, this.center.y - this.crossFat, this.crossSize, this.crossSize);
        dest.stroke();

        dest.beginPath();
        dest.strokeStyle = ColorToHtml(this.cfg.globals.ReticleTargetColor);
        Drawx.DrawLine(dest, this.CSize,this.center.x, this.center.y - this.crossSize, this.center.x, this.center.y - this.crossFat);
        Drawx.DrawLine(dest, this.CSize,this.center.x, this.center.y + this.crossSize, this.center.x, this.center.y + this.crossFat);
        Drawx.DrawLine(dest, this.CSize,this.center.x - this.crossSize, this.center.y, this.center.x - this.crossFat, this.center.y);
        Drawx.DrawLine(dest, this.CSize,this.center.x + this.crossSize, this.center.y, this.center.x + this.crossFat, this.center.y);
        dest.stroke();
    }

}