import { Component, OnInit, Inject } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';
import { Router } from '@angular/router';
import { Globals, GlobalInfo } from 'src/app/models/globals';
import { saveAs } from 'file-saver';
import { Point } from 'src/app/models/smallclasses'

interface RotationAmt {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'property-dlg',
  templateUrl: './property-dlg.component.html',
  styleUrls: ['./property-dlg.component.less']
})
export class PropertyDlgComponent implements OnInit {

  private cfg : ConfigurationService;
  private value : any;
  public FocusHeight : string = "1.0";
  public VideoUrl : string = "http://zerocam3.local/?action=stream";
  public MachineUrl : string = "http://duet3mill.local";
  public CenterX : string = "";
  public CenterY : string = "";
  public SpindleX : string = "";
  public SpindleY : string = "";
  public Resolution : string = "";
  public VideoRotate : string = "";
  public VideoSize : Point = new Point(0,0);
  public IsMetric : boolean = false;
  
  rotations: RotationAmt[] = [
    {value: '0', viewValue: 'None'},
    {value: '90', viewValue: '90 degrees'},
    {value: '180', viewValue: '180 degrees'},
    {value: '270', viewValue: '270 degrees'},
  ];

  constructor(@Inject(ConfigurationService) confServe : ConfigurationService, private router : Router)
  {
    this.cfg = confServe;
    this.readGlobals();
 }

 readGlobals() : void {
    let glob = this.cfg.globals;
    this.CenterX = glob.VideoCenter.x.toString();
    this.CenterY = glob.VideoCenter.y.toString();
    this.SpindleX = glob.CameraOffset.x.toString();
    this.SpindleY = glob.CameraOffset.y.toString();
    this.Resolution = glob.VideoResolution.toString();
    this.VideoRotate = glob.VideoRotation.toString();
    this.MachineUrl = glob.DwcUrl;
    this.VideoUrl = glob.VideoUrl;
    this.VideoSize = glob.VideoSize;
    this.IsMetric = glob.IsMetric;
 }

  ngOnInit(): void {
    this.VideoUrl = this.cfg.globals.VideoUrl;
    this.FocusHeight = this.cfg.globals.FocusHeight.toString();
  }

  OnGoBack()
  {
    // update rotation amount
    let x = Number.parseFloat(this.VideoRotate);
    if(!isNaN(x))
    {
      this.cfg.globals.VideoRotation = x;
    }
    GlobalInfo.SaveGlobals(this.cfg);
    this.router.navigate(['']);
  }

  private SetDirty()
  {
    this.cfg.globalinfo.isGlobalsDirty = true;
    this.cfg.globals.IsBrandNew = false;    // something has changed in the settings
  }

  OnChangeCenter()
  {
    let x = Number.parseFloat(this.CenterX);
    if(!isNaN(x))
      this.cfg.globals.VideoCenter.x = x;

    x = Number.parseFloat(this.CenterY);
    if(!isNaN(x))
      this.cfg.globals.VideoCenter.y = x;
    this.SetDirty();
  }

  OnChangeSpindle()
  {
    let x = Number.parseFloat(this.SpindleX);
    if(!isNaN(x))
      this.cfg.globals.CameraOffset.x = x;
    this.SpindleX = this.cfg.globals.CameraOffset.x.toString();

    x = Number.parseFloat(this.SpindleY);
    if(!isNaN(x))
      this.cfg.globals.CameraOffset.y = x;
    this.SpindleY = this.cfg.globals.CameraOffset.y.toString();
    this.SetDirty();
  }

  OnChangeResolution()
  {
    let x = Number.parseFloat(this.Resolution);
    if(!isNaN(x))
      this.cfg.globals.VideoResolution = x;
    this.Resolution = this.cfg.globals.VideoResolution.toString();
    this.SetDirty();
  }

  OnChangeFocusHeight()
  {
    let x = Number.parseFloat(this.FocusHeight);
    if(!isNaN(x))
      this.cfg.globals.FocusHeight = x;
    this.FocusHeight = this.cfg.globals.FocusHeight.toString();
    this.SetDirty();
  }

  OnChangeVideoUrl()
  {
    this.cfg.globals.VideoUrl = this.VideoUrl;
    this.SetDirty();
  }

  OnChangeMachineUrl()
  {
    this.cfg.globals.DwcUrl = this.MachineUrl;
    this.SetDirty();
  }

  OnChangeIsMetric()
  {
    this.cfg.globals.IsMetric = this.IsMetric;
    this.SetDirty();
  }

  writeTextFile(fname: string, text : string)
  {
      let myfile = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(myfile, fname);
  }

  getNewFileHandle() : string {
    const opts = {
      types: [{
        description: 'Text file',
        accept: {'text/plain': ['.txt']},
      }],
    };
    return (<any>window).showSaveFilePicker(opts);
  }

      // this asynchronously reads the file
  readTextFile(file : File, readit: (ss: string | ArrayBuffer | null) => void)
  {
    if (file)
    {
      let r = new FileReader();
      r.onloadend = () => {
            readit(r.result);
          };
      r.readAsText(file);
      this.SetDirty();
    }
    else
    {
        console.log('failed to read file ');
    }
  }
  

  DoSaveAs(ev: Event) : void
  {
    const ele = ev.target as HTMLInputElement;
    const files = ele.files as FileList;
    let txt = JSON.stringify(this.cfg.globals);
    this.writeTextFile(files[0].name, txt);
  }

    // parse the json globals input and save it
  ParseTheJsonGlobal(txt: string | ArrayBuffer | null)
  {
    let gb = {}
    console.log('parsing json')
    let txts = txt as string;
    if( txts != null)
    {
      gb = JSON.parse(txts);
      console.log( JSON.stringify(gb))
      if( gb != null)
      {
        // place it into the saved data temporarily to use the autoupdate stuff
        this.cfg.saveObject(GlobalInfo.GLOBALS_KEY, gb)
        // use and save it for real
        this.cfg.useSavedGlobals();
        // update displayed values
        this.readGlobals();
      }
    }
  }

  DoConfSave()
  {
    console.log('saving file')
    let txt = JSON.stringify(this.cfg.globals);
    this.writeTextFile("SpindleConf.cnf", txt);
  }

  DoLoadFrom(ev: Event) : void
  {
    console.log('loading from')
    const ele = ev.target as HTMLInputElement;
    const files = ele.files as FileList;
    this.readTextFile(files[0], (txt) => this.ParseTheJsonGlobal(txt));
  }


}
