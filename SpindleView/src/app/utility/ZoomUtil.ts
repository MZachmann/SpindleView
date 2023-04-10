import { Coord3d, Point } from "../models/smallclasses";
import { ConfigurationService } from "../services/configuration";

export class ZoomUtil
{
    // convert an incoming display location to our internal mouse environment position
    // where 0,0 is lower left and zoom=1
    public static DisplayToMouse(cfg: ConfigurationService, pt: Point) {
        let ptn = new Point(0,0);
        let glob = cfg.globals;
        ptn.x = pt.x / glob.ZoomAmount;
        ptn.y = glob.VideoSize.y - pt.y / glob.ZoomAmount;      // so 0,0 is lower left
        return ptn;
    }

    // convert an internal mouse position to a current display location
    public static MouseToDisplay(cfg: ConfigurationService, pt: Point) {
        let ptn = new Point(0,0);
        let glob = cfg.globals;
        ptn.x = pt.x * glob.ZoomAmount;
        ptn.y = (glob.VideoSize.y - pt.y) * glob.ZoomAmount;      // so 0,0 is lower left
        return ptn;
    }
    // convert an internal bitmap coordinate to a mouse type position
    public static BitmapToMouse(cfg: ConfigurationService, pt: Point) {
        return new Point(pt.x, cfg.globals.VideoSize.y - pt.y);
    }
    // convert a position on the display to machine coords in inches
    // assert that   globalinfo.MachinePosn = the center of the video image
    public static MouseToMachine(cfg : ConfigurationService, pt : Point) : Point {
        let ptn = new Point(0,0);
        let glob = cfg.globals;
        let ptV = ZoomUtil.BitmapToMouse(cfg, glob.VideoCenter);
        // the x dimension origin is upper left in imgs so...
        ptn.x = cfg.globalinfo.MachinePosn.x - glob.CameraOffset.x - (ptV.x - pt.x) / (glob.VideoResolution);
        ptn.y = cfg.globalinfo.MachinePosn.y - glob.CameraOffset.y - (ptV.y - pt.y) / (glob.VideoResolution);
        return ptn;
    }

    // convert a position on the display to workspace coords in inches
    // assert that   globalinfo.WorkspacePosn = the center of the video image
    public static MouseToWorkspace(cfg : ConfigurationService, pt : Point) : Point {
        let ptn = new Point(0,0);
        let glob = cfg.globals;
        // the x dimension origin is upper left in imgs so...
        let ptV = ZoomUtil.BitmapToMouse(cfg, glob.VideoCenter);
        ptn.x = cfg.globalinfo.WorkspacePosn.x - glob.CameraOffset.x - (ptV.x - pt.x) / (glob.VideoResolution);
        ptn.y = cfg.globalinfo.WorkspacePosn.y - glob.CameraOffset.y - (ptV.y - pt.y) / (glob.VideoResolution);
        return ptn;
    }

}
