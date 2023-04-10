
export enum Units
{
    Inch,
    MM,
    Pixel
}

export enum Measurement
{
    Distance = 1,
    Workspace,
    Machine,
    LengthAngle
}

export enum UseMjpeg
{
    Automatic = 1,
    ManualYuy,
    ManualJpeg,
    ManualNV12
}

export class Coord3d {
    public x : number = 0;
    public y : number = 0;
    public z : number = 0;
    constructor(x:number, y:number, z:number) {this.x=x;this.y=y;this.z=z;}
}

export class Coord3dUtil {
    public static clone(p : Coord3d ) : Coord3d { return new Coord3d(p.x, p.y, p.z); }
 }


export class Point { 
    public x : number = 0;
    public y : number = 0;
    constructor(x:number, y:number) {this.x=x;this.y=y}
 }

 export class PointUtil {
    public static clone(p : Point ) : Point { return new Point(p.x, p.y); }
 }

export class Rect {
    public x : number = 0;
    public y : number = 0;
    public x2 : number = 0;
    public y2 : number = 0;
    constructor(x: number,y: number,x2: number,y2: number) { this.x=x; this.y=y; this.x2=x2; this.y2=y2; }
    public width() { return this.x2 - this.x; }
    public height() { return this.y2 - this.y; }
 }

export class Color {
     public r : number = 0;
     public g : number = 0;
     public b : number = 0;
     public x : number = 15; // not getting this but 15 seems right
     constructor(r: number,g: number,b: number,x: number = 15) { this.r=r; this.g=g; this.b=b; this.x=x; }
 }

 function componentToHex(c : number) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  export function ColorToHtml(clr : Color) : string {
    return "#" + componentToHex(clr.r) + componentToHex(clr.g) + componentToHex(clr.b) + componentToHex(clr.x);
  }

//  export function ColorToHtml( cc : Color) : string {
//      return '#' + cc.r.toString(16) + cc.g.toString(16) + cc.b.toString(16) + cc.x.toString(16);
//  }
