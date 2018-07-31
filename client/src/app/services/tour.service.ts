// Angular
import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
// store
import { filter } from "rxjs/operators";
// app
import { AppConfig } from "../app.config";

@Injectable()
export class TourService {

  constructor(private router: Router) {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        // ensure the tour is initialized after every route change so the next
        // step can be shown
        for (const name of AppConfig.TOURS) {
          window[name].init();
        }
      });
  }

  startTour(name: string): void {
    if (window.hasOwnProperty(name)) {
      window[name].end();
      window[name].restart();
    }
  }
}
