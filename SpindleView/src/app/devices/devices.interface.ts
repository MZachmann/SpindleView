import { CommModel, CommService } from "../services/communication"
import { ConfigurationService } from "../services/configuration"
import { RepRapDevice } from "../devices/reprap"
import { Point } from "../models/smallclasses";

export interface CncDevice
{
    GetCurrentPosition(cms: CommService, cfg: ConfigurationService) : boolean;
    SetMachineZ(cms: CommService, poss : number) : boolean;
    SetMachineXY(cms: CommService, poss : Point) : boolean;
}

export class CncDevices {
    static CncDeviceFactory(who : string) : CncDevice {
        switch(who) {
            case "reprap" :
                return new RepRapDevice();
        }
        return new RepRapDevice();
    }
}


