import { Inject, Injectable } from '@angular/core';
import { Globals, GlobalInfo } from '../models/globals';
import { LocalStorageService } from './localstorage';

// Note that all coordinates in globals and globalinfo are in either pixels or inches depending on
// if it's a physical coordinate

export declare abstract class ConfigWatcher {
    abstract configNotify(key : string): void;
}

@Injectable({providedIn: 'root'})
export class ConfigurationService
{
    private lclServer : LocalStorageService;
    private subscribers : ConfigWatcher[];
    public globals : Globals;
    public globalinfo : GlobalInfo;

    constructor(@Inject(LocalStorageService) localServe : LocalStorageService)
    {
        this.lclServer = localServe;
        this.subscribers = [];
        this.globalinfo = new GlobalInfo();
        this.globals = GlobalInfo.DefaultGlobals();
        this._initialize();
        GlobalInfo.RecolorReticle(this.globals);
    }

    _initialize()
    {
        if ( ! this.updateObject(GlobalInfo.GLOBALS_KEY, this.globals))
        {
            GlobalInfo.SaveGlobals(this);
        }
    }

    public updateObject(key : string, data : any) : boolean
    {
        let lserve = this.lclServer;
        let olddata = lserve.getItem(key);

        let bdid : boolean  = false;
        if(olddata != null)
        {
            // see if major version matches
            let v = "VersionMajor";
            let bdoit : boolean = true;
            if( data.hasOwnProperty(v))
            {
                if( !olddata.hasOwnProperty(v) || olddata[v] != data[v])
                    bdoit = false;
            }
            if(bdoit)
            {
                // copy properties from glob to our globals
                let destlist = Object.getOwnPropertyNames(data);
                destlist.forEach(element => {
                    if( olddata.hasOwnProperty(element))
                    {
                        // ! dangerous but ...
                        (data as any)[element] = olddata[element];
                    }
                });
                bdid = true;
            };
        }
        return bdid;    // did we find one?
    }

    public saveObject(key : string, data : any)
    {
        this.lclServer.setItem(key, data);
    }

    public loadObject(key : string) : any
    {
        return this.lclServer.getItem(key);
    }

    addSubscriber(sub : ConfigWatcher)
    {
        let x = this.subscribers.indexOf(sub);
        if (x == -1)
        {
            this.subscribers.push(sub);
        }
    }

    removeSubscriber(sub : ConfigWatcher)
    {
        let x = this.subscribers.indexOf(sub);
        if (x != -1)
        {
            this.subscribers.splice(x, 1);
        }
    }

    // whenever we send a notifiable command of any kind this gets called
    // on the return. So, tell any CommWatchers we're received
    sendNotification(key : string)
    {
      // let x = resp;
      this.subscribers.forEach( (sub) => sub.configNotify(key));
    }
}
