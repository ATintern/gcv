// Angular
import { HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppConfig } from "./app.config";
// routing
import { AppRoutingModule } from "./app-routing.module";
// components
import * as fromComponents from "./components";
import { AlertComponent, MacroComponent, MicroComponent, PlotComponent }
  from "./components";
// directives
import * as fromDirectives from "./directives";
// services
import * as fromServices from "./services";
// route guards
import * as fromGuards from "./guards";
// ngrx store
import { RouterStateSerializer, StoreRouterConnectingModule } from "@ngrx/router-store";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { metaReducers, reducers, effects } from "./store";
import { CustomRouterStateSerializer } from "./utils";

@NgModule({
  bootstrap: [ fromComponents.AppComponent ],
  declarations: [ ...fromComponents.components, ...fromDirectives.directives ],
  entryComponents: [ AlertComponent, MacroComponent, MicroComponent, PlotComponent ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    StoreRouterConnectingModule.forRoot({serializer: CustomRouterStateSerializer}),
    EffectsModule.forRoot(effects),
  ],
  providers: [
    AppConfig,
    {
      deps: [ AppConfig ],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
    },
    ...fromServices.services,
    ...fromGuards.guards
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
})
export class AppModule { }
