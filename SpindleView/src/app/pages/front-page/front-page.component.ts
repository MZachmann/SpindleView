import { Component, OnInit, Inject } from '@angular/core';
import { ConfigurationService } from 'src/app/services/configuration';

@Component({
  selector: 'front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.less']
})
export class FrontPageComponent implements OnInit {
  private cfg : ConfigurationService;
  public ScreenOrient : string = "";
  public BackColor : string = "white";
  public ScreenColors : string = "";
  
  constructor(@Inject(ConfigurationService) confServe : ConfigurationService)
  {
    this.cfg = confServe;
    this.setVerticalPrompt();
    this.setColorPalette();
  }

  ngOnInit(){
  
  }

  swapVertical() {
    this.cfg.globals.IsIconsVertical = !this.cfg.globals.IsIconsVertical;
    this.setVerticalPrompt();
    this.cfg.globalinfo.isGlobalsDirty = true;
  }

  swapPalette() {
    this.cfg.globals.ColorPalette = (this.cfg.globals.ColorPalette == "Dark") ? "Light" : "Dark";
    this.setColorPalette();
    this.cfg.globalinfo.isGlobalsDirty = true;
  }

  setVerticalPrompt()
  {
    this.ScreenOrient = this.cfg.globals.IsIconsVertical ? "Wide Screen" : "Narrow Screen";
  }

  setColorPalette() {
    this.BackColor = (this.cfg.globals.ColorPalette == "Dark") ? "#888" : "white";
    this.ScreenColors = (this.cfg.globals.ColorPalette == "Dark") ? "Light" : "Dark";
  }
  

  setToDark()
  {

  }

}
