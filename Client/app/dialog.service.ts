import { Injectable } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalContentComponent } from "./ModalContentComponent";
import { Http } from "@angular/http";
import * as Rx from "rxjs";

@Injectable()
export class DialogService {

    public bsModalRef: BsModalRef;
    constructor(
        private modalService: BsModalService,
        private http: Http,
    ) { }

    public openModalWithComponent() {
        const list = ["Open a modal with component", "Pass your data", "Do something else", "..."];
        this.bsModalRef = this.modalService.show(ModalContentComponent);
        this.bsModalRef.content.title = "Modal with component";
        this.getData().subscribe((result) => {
            this.bsModalRef.content.list = result;
        });
    }

    private getData(): Rx.Observable<any[]> {
        return this.http.get("http://localhost:58159/api/values")
            .map((response) => response.json() as any[]);
    }
}