// Angular + dependencies
import { Component } from "@angular/core";
import { GCV } from "../../../assets/js/gcv";

// App
import { Viewer } from "./viewer.component";

@Component({
  selector: "viewer-macro",
  styles: [`
    .viewer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }
  `],
  templateUrl: "./viewer.component.html",
})
export class MacroViewerComponent extends Viewer {

  constructor() {
    super("Macro-Synteny");
  }

  draw(): void {
    if (this.el !== undefined && this.data !== undefined) {
      this.destroy();
      this.viewer = new GCV.visualization.Macro(
        this.el.nativeElement,
        this.data,
        this.args,
      );
    }
  }
}
