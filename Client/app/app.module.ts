
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, Http } from "@angular/http";

import { AppComponent } from "./app.component";

import { Ng2TableModule } from "./ng-table/ng-table-module";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2TableModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
