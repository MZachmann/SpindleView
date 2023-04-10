import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { lastValueFrom, Observable, ReplaySubject } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { environment } from '../environments/environment';
import { ConfigurationService } from './configuration';
import { Queue } from '../utility/Queues';
import { DebugUtil } from '../utility/DebugUtil';

export declare abstract class CommWatcher {
    abstract commNotify(cmd : string): void;
}

export class CommModel {
    public command : string;
    public postdata : Object = [];              // if using post
    public datatype : string;
    public response? : ReplaySubject<string>;     
    public httpType : string; // for text
    public endTime : number;
    constructor()
    {
        this.command = '';
        this.datatype = '';
        this.httpType = 'G';    // get
        this.endTime = 0;
    }
}

@Injectable({providedIn: 'root'})
export class CommService  {
    // private headers = new Headers();
    private http : HttpClient;
    public responsive : string;
    private subscribers : CommWatcher[];
    private token : string;
    private cfg : ConfigurationService;
    private ModelQ : Queue<CommModel>;
    private isPacketDone : ReplaySubject<boolean>;
    private isEmpty : boolean;


    constructor(@Inject(HttpClient) http : HttpClient, @Inject(ConfigurationService) confServe : ConfigurationService,) {
        DebugUtil.IfConsole('------------> Starting Communication Service');
        this.http = http;
        this.subscribers = [];
        this.token = '';
        this.responsive = '';
        this.cfg = confServe;
        this.cfg.globalinfo?.SetupPosReader(this.cfg, this);    // set up the position reader here...
        this.ModelQ = new Queue<CommModel>(20);
        this.isPacketDone = new ReplaySubject<boolean>();
        this.isPacketDone.subscribe( () => this.execNextPacket());
        this.isEmpty = true;
    }

    private getBaseUrl() : string
    {
        return this.cfg.globals.DwcUrl;
    }

    SetToken( newToken : string)
    {
        this.token = newToken;
    }

    // do this to support 192.168.0.57 for testing but allow that or lamps.home for production
    // and then we can use DNS mapping to support lamps.home
    addSubscriber(sub : CommWatcher)
    {
        let x = this.subscribers.indexOf(sub);
        if (x == -1)
        {
            this.subscribers.push(sub);
        }
    }

    removeSubscriber(sub : CommWatcher)
    {
        let x = this.subscribers.indexOf(sub);
        if (x != -1)
        {
            this.subscribers.splice(x, 1);
        }
    }
    
    private handleError() {

    }

    private subSendPacket(model : CommModel) : boolean
    {
        let myheaders : HttpHeaders = this.addHeader(this.getBaseHeaders(), model);
        let dest = this.getBaseUrl() + '/' + encodeURI(model.command);
        // console.log('ss******>>' + this.getBaseUrl() + cmdtext);
        let theResponse = this.http.get(dest, { headers: myheaders, responseType: 'text' });
        if(theResponse != null)
        {
            theResponse.subscribe((res : string) => { 
                DebugUtil.IfConsole("Rcv: " + model.command + ':' + res);
                model?.response?.next(res);                     
                this.isPacketDone.next(true);
                model?.response?.complete();    // and we're done here
            }, (error) => {
                // error response from http get request
                DebugUtil.IfConsole("Rcv Error: " + model.command + ':' + error.message);
                model?.response?.next('');                     
                this.isPacketDone.next(true);
                model?.response?.complete();    // and we're done here
            });
        }
        return true;
    }

    // send data using post instead of just get
    // on true the model.response is observable
    subPostPacket(model : CommModel) : boolean
    {
        let myheaders : HttpHeaders = this.addHeader(this.getBaseHeaders(), model);
        let dest = this.getBaseUrl() + '/' + encodeURI(model.command);
         // console.log('pp******>>' + this.getBaseUrl() + model.command);
        let theResponse = this.http.post(dest, model.postdata, { headers: myheaders, responseType: 'text' }); //.catch(this.handleError);
        if(theResponse != null) {
            theResponse.subscribe((res : string) => { 
                DebugUtil.IfConsole("Rcv: " + model.command);
                model?.response?.next(res);
                model?.response?.complete();    // and we're done here
                this.isPacketDone.next(true);
            }, (error) => {
                // error response from http get request
                DebugUtil.IfConsole("Rcv Error: " + model.command + ':' + error.message);
                model?.response?.next('');                     
                this.isPacketDone.next(true);
                model?.response?.complete();    // and we're done here
            });
        }
         return true;
    }

    private subSendPacketNotified(model : CommModel) : boolean
    {
        //console.log('*****>> initializing packet stuff');
        let myheaders : HttpHeaders = this.addHeader(this.getBaseHeaders(), model);
        let dest = this.getBaseUrl() + '/' + encodeURI(model.command);
        let theResponse = this.http.get(dest, { headers: myheaders, responseType: 'text' }); //.share().catch(this.handleError);

        // we want to intercept it to know when things are coming
        if (theResponse != null)
        {
            theResponse.subscribe( (res : any) => { 
                DebugUtil.IfConsole("Rcv: " + model.command);
                this.getNotifyResponse(model?.command??"", res); 
                  this.isPacketDone.next(true);
                  model?.response?.complete();    // and we're done here
                },
                (error) => {
                    // error response from http get request
                    DebugUtil.IfConsole("Rcv Error: " + model.command + ':' + error.message);
                    model?.response?.next('');                     
                    this.isPacketDone.next(true);
                    model?.response?.complete();    // and we're done here
                });
        }

        return (theResponse != null);;
    }

    private execNextPacket() : boolean {
        let model = this.ModelQ.dequeue();
        if(model == undefined) {
            this.isEmpty = true;
            return false;
        }

        let rslt : boolean = false;
        DebugUtil.IfConsole("Execing: " + model.command);
        if(model.endTime != 0) {
            if( ((new Date()).getTime()) > model.endTime) {
                this.isPacketDone.next(true);   // past time to run, skip it
                rslt = true;
            }
        }

        if( ! rslt) {
            switch(model.httpType) {
                case 'G' :  // get
                    rslt = this.subSendPacket(model);
                    break;
                case 'N' :  // get notified
                    rslt = this.subSendPacketNotified(model);
                    break;
                case 'P' : // post
                    rslt = this.subPostPacket(model);
                    break;
                default :   // ???
                    this.isPacketDone.next(true);
                    break;
            }
        }
        return rslt;
    }

    // this way we do packets serially just in case
    private addPacketToQueue(model: CommModel) : boolean {
        model.response = new ReplaySubject<string>();
        if(this.isEmpty) {
            this.isEmpty = false;
            this.ModelQ.enqueue(model);     // stick it in the comm queue
            this.isPacketDone.next(true);   // send a ping now
        }
        else{
            this.ModelQ.enqueue(model);     // stick it in the comm queue
        }
        return true;
    }

    sendPacketNotified(model : CommModel) : boolean
    {
        model.httpType = 'N';
        return this.addPacketToQueue(model);
    }

    // send a random command to the server, don't echo to subscribers
    // on true the model.response is observable
    sendPacket(model : CommModel) : boolean
    {
        model.httpType = 'G';
        return this.addPacketToQueue(model);
    }

    // send data using post instead of just get
    // on true the model.response is observable
    postPacket( model : CommModel) : boolean
    {
        model.httpType = 'P';
        return this.addPacketToQueue(model);
    }

    private getBaseHeaders() : HttpHeaders
    {
        // Octoprint uses a symbol credential scheme
        let headers = new HttpHeaders();
        if (this.token.length > 0)
        {
            headers = headers.append('Token', this.token);
        }
        //headers.append('Authorization',this.basic);
        return headers;
    }

    private addHeader(myheader : HttpHeaders, model: CommModel) : HttpHeaders
    {
        if (model.datatype.length > 0)
        {
            myheader = myheader.append('Content-Type', model.datatype);
            //myheaders.append('Accept', model.datatype);
        }
        else
        {
            myheader = myheader.append('Content-Type', 'text/plain');
        }
        return myheader;
    }

    // whenever we send a notifiable command of any kind this gets called
    // on the return. So, tell any CommWatchers we're received
    private getNotifyResponse(cmd : string, _resp : any)
    {
      this.ModelQ.dequeue();  // we got a response
      // let x = resp;
      this.subscribers.forEach( (sub) => sub.commNotify(cmd));
    }

    private static async SynchroHelper<T>( o: Observable<T>) : Promise<T> {
        let result = await o.toPromise() as T;
        return result;
     }

        // synchronously wait for an observable to finish
    static SynchroWait<T>(o : Observable<T>) : T | null {

        let result : any = null;
        this.SynchroHelper(o)
            .then((x) => {result = x;})
            .catch((x) => console.log(x??'rejected'));
        return result;
    }

}
