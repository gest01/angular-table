
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, Http } from "@angular/http";

import { AppComponent } from "./app.component";
import { NavComponent } from "./nav.component";
import { HomeComponent } from "./home.component";
import { NotFoundComponent } from "./notfound.component";

import { AppRoutingModule } from "./app-routing.module";
import { Ng2TableModule } from "./ng-table/ng-table-module";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2TableModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    NotFoundComponent,
  ],
  providers: [
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
