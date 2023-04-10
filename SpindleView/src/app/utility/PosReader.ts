import { CommService } from "../services/communication";
import { ConfigurationService } from "../services/configuration";

// read position on a regular basis
export class PosReader {
    private LastTime : number = (new Date()).getTime();
    private cfg : ConfigurationService;
    private comm : CommService;

    constructor(cfg: ConfigurationService, comm : CommService)
    {
        this.cfg = cfg;
        this.comm = comm;
    }

    // this gets called a lot and rereads the current position every now and then
    public ReadPositions(elapsed: number) {
        let thisTime = (new Date()).getTime();
        if((thisTime - this.LastTime ) > elapsed)
        {
            this.cfg.globalinfo.cncDev?.GetCurrentPosition(this.comm, this.cfg);
            this.LastTime = thisTime;
        }
    }
}