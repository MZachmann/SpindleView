import { Inject } from "@angular/core";
import { Observable } from "rxjs";
import { InchPixels } from "../models/InchPixels";
import { CommModel, CommService } from "../services/communication";
import { ConfigurationService } from "../services/configuration";
import { CncDevice } from "./devices.interface";
import { Point } from 'src/app/models/smallclasses';
import { DebugUtil } from "../utility/DebugUtil";

export class RepRapDevice implements CncDevice
{
    // parse the json and then use it to update machine positions
    // parse the json and then use it to update machine and workspace positions
    static HandlePosition(cfg: ConfigurationService, x : string) {
        if(x == null || x.length == 0)
            return;
            
        let u = JSON.parse(x);
        let v = u as any;
        if(v != null) {
            // update machine position
        // reprap status always returns mm afaik
            if(v.hasOwnProperty("machine")) {
                DebugUtil.IfConsole(v["machine"].toString());
                let mac : any = v["machine"];
                let mco = mac as number[];
                cfg.globalinfo.MachinePosn.x = InchPixels.MMtoInch(mac[0]);
                cfg.globalinfo.MachinePosn.y = InchPixels.MMtoInch(mac[1]);
                cfg.globalinfo.MachinePosn.z = InchPixels.MMtoInch(mac[2]);
            }
            // update workspace position
            if(v.hasOwnProperty("pos")) {
                let mac : any = v["pos"];
                let mco = mac as number[];
                cfg.globalinfo.WorkspacePosn.x = InchPixels.MMtoInch(mac[0]);
                cfg.globalinfo.WorkspacePosn.y = InchPixels.MMtoInch(mac[1]);
                cfg.globalinfo.WorkspacePosn.z = InchPixels.MMtoInch(mac[2]);
            }

            cfg.globalinfo.hasChangedCoords.next(true);        // coordinate change notice
        }
    }

    static UpdatePosition( cfg: ConfigurationService, o: Observable<string>) : void {
        o.subscribe((x) => { RepRapDevice.HandlePosition(cfg, x); });
    }

    public SendGcode(cms: CommService, gcode: string) : CommModel {
        let result = false;
        let cmmodel = new CommModel();
        cmmodel.command = 'rr_gcode?gcode=' + gcode;
        cmmodel.datatype = 'text';
        cms.sendPacket(cmmodel);
        if( cmmodel.response) {
            cmmodel.response.subscribe((x) => { console.log("gcode reponse=" + x); });
            // cmmodel.response.subscribe((x) => { ; });
        }
        return cmmodel;
    }

    public GetCurrentPosition(cms: CommService, cfg: ConfigurationService) : boolean {
        let result = false;
        let cmmodel = new CommModel();
        cmmodel.command = 'rr_status';
        cmmodel.datatype = 'text';
        cmmodel.endTime = ((new Date()).getTime()) + 1000;  // 1 second from now we don't care any more
        if( cms.sendPacket(cmmodel) && cmmodel.response)
        {
            RepRapDevice.UpdatePosition(cfg, cmmodel.response);
        }
        return result;
   }

   // input poss is in inches while the machine is always in MM
   public SetMachineZ(cms: CommService, poss : number) : boolean {
        DebugUtil.IfConsole("Set Machine Z=" + poss);
        let result = false;
        let gcs = 'G53 G0 Z' + InchPixels.InchToMM(poss);
        let cmodel = this.SendGcode(cms, gcs);
        return result;
    }

   // input poss is in inches while the machine is always in MM
   public SetMachineXY(cms: CommService, poss : Point) : boolean {
        DebugUtil.IfConsole("Set Machine XY=" + InchPixels.InchToMM(poss.x) + "," + InchPixels.InchToMM(poss.y));
        let result = false;
        let gcs = 'G53 G0 X' + InchPixels.InchToMM(poss.x) + ' Y' + InchPixels.InchToMM(poss.y);
        let cmodel = this.SendGcode(cms, gcs);
        return result;
    }
}