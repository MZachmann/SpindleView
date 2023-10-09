import { ReplaySubject } from 'rxjs';
import { Measurement, UseMjpeg, Units, Point, Rect, Color, Coord3d } from './smallclasses'
import { ConfigurationService } from '../services/configuration';
import { CncDevice, CncDevices } from '../devices/devices.interface';
import { PosReader } from '../utility/PosReader';
import { CommService } from '../services/communication';

export class GlobalInfo
{
    public static readonly GLOBALS_KEY : string = "GLOBALS_KEY";
    public static readonly PollingTime : number = 1000; // min time between CNCdev poll calls
    // observables 
    public hasChangedCoords : ReplaySubject<boolean> = new ReplaySubject<boolean>();
    public hasChangedZoom :  ReplaySubject<boolean> = new ReplaySubject<boolean>();
    // random properties
    public isGlobalsDirty : boolean = false;
    public cncDev : CncDevice;
    public posReader? : PosReader;
    // local position variables in pixels
    public MousePt : Point = new Point(0,0);     // this is relative to the current zoomed window for accuracy
    public ClickPt : Point = new Point(0,0);     // i.e. relative to image size
    // the data read from the device - supporting 3 axes
    // assumed in inches
    public MachinePosn : Coord3d = new Coord3d(0,0,0);
    public WorkspacePosn : Coord3d = new Coord3d(0,0,0);
    public CurrentRotation : number = 0;


    constructor() {
        this.cncDev = CncDevices.CncDeviceFactory("reprap");
    }

    public SetupPosReader(cfg: ConfigurationService, comm : CommService) {
        if( ! this.posReader) {
            this.posReader = new PosReader(cfg, comm);
        }
    }

    public static SaveGlobals(cfg: ConfigurationService) {
        cfg.saveObject(GlobalInfo.GLOBALS_KEY, cfg.globals);
        cfg.globalinfo.isGlobalsDirty = false;
    }

    public static DefaultGlobals() : Globals
    {
        var glob = new Globals();
        glob.IsCompact = false;
        glob.CameraOffset = new Point(0, 2);
        glob.VideoUrl = "http://zerocam4.local/?action=stream";
        glob.VideoSize = new Point(2592, 1460);
        glob.VideoCenter = new Point(glob.VideoSize.x/2, glob.VideoSize.y/2);
        glob.VideoRotation = 0;
        glob.VideoResolution = 1000.0;
        glob.ZoomAmount = 1.0;
        glob.Unit = Units.Inch;
        glob.InchesPerCalibrate = 1.0;
        glob.ViewSize = new Rect(50, 50, 850, 650);
        glob.MeasureMode = Measurement.Distance;
        glob.CNCFolder = "C:\\WinCNC";
        glob.CNCProcessName = "WinCnc";
        glob.PaperHeight = 0.115;
        glob.Reticle = "cross";
        glob.ReticleLineColor = new Color(0,0,125,85);
        glob.ReticleLineAccentColor = new Color(0,0,125,255);  // not clear why this works and not 255...
        glob.ReticleTargetColor = new Color(128,0,0,60);
        glob.IsShowHints = true;
        glob.ColorPalette = "Light";
        glob.IsIconsVertical = false;
        return glob;
    }

    public static RecolorReticle(glob: Globals) {
        glob.ReticleLineColor = new Color(0,125,0,255);
        glob.ReticleLineAccentColor = new Color(0,0,125,255);  // not clear why this works and not 255...
        glob.ReticleTargetColor = new Color(255,0,0,255);
    }

}

// this must be based on object so we can load/save it
export class Globals
    {
        public Version : number = 1;
        public VersionMajor : string = "pre2";

        public IsBrandNew : boolean = true;     // if globals is strictly from default and probably garbage
        public IsUsingMjpeg : UseMjpeg = UseMjpeg.Automatic;
        public IsCompact : boolean = false;
        public IsUseCncDll : boolean = false;
        public IsShowHints : boolean = true;

        public IsExpandLoc : boolean = true;
        public IsExpandZoom : boolean = true;
        public IsExpandReticles : boolean = true;
        public IsIconsVertical : boolean = false;
        public IsMetric : boolean = false;
        
        public ColorPalette : string = "Light";

        public DeviceName : string= "";
        public ControllerName : number = 0;
        public VideoUrl : string = "";
        public DwcUrl : string = "";
        public CNCFolder : string = "";
        public CNCCaption : string= "";
        public CNCProcessName : string= "";

        public FocusHeight : number = 0;
        public MaterialHeight : number = 0.0;

        // the offset in inches from the camera location (see VideoCenter) to the
        // physical drill bit
        public CameraOffset : Point = new Point(0,0);
        // Windows 7 doesn't support mpg reading with the ELP because of a bug in the firmware.
        // so use YUY2 in that case
        public VideoSize : Point = new Point(0,0);
        public VideoResolution : number = 0;
        public VideoRotation : number = 0;

        // this is the location in the video field we find the offset to for where the drill would hit
        // it is the 'fixed' point when the head moves up/down
        public VideoCenter : Point = new Point(0,0);
        public MeasureMode : Measurement = Measurement.Distance;
        public ViewSize : Rect = new Rect(0,0,0,0); // startup window size
        public ZoomAmount : number = 0;
        public PaperHeight : number = 0;
        public Unit : Units = Units.Inch ;
        public InchesPerCalibrate : number = 0;
        public JogAmount : number = 0;
        public Reticle : string = "";
        public ReticleLineColor : Color = new Color(0,0,0);
        public ReticleLineAccentColor : Color = new Color(0,0,0);
        public ReticleTargetColor : Color = new Color(0,0,0);
}
