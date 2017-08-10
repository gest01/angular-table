
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, Http } from "@angular/http";

import { AppComponent } from "./app.component";
import { PopoverModule } from "ngx-bootstrap/popover";
import { Ng2TableModule } from "./ng-table/ng-table-module";
import { ModalModule } from "ngx-bootstrap/modal";
import { ModalContentComponent } from "./ModalContentComponent";
import { DialogService } from "./dialog.service";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2TableModule,
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    ModalContentComponent,
  ],
  providers: [
    DialogService,
  ],
  bootstrap: [
    AppComponent,
  ],
  entryComponents: [
    ModalContentComponent,
  ],
})
export class AppModule { }
