import {Component, Inject, Input, OnInit} from "@angular/core";
import {DataService} from "@shared/service/data.service";
import {EruptModel, RowOperation} from "../../model/erupt.model";
import {DA_SERVICE_TOKEN, TokenService} from "@delon/auth";
import {NzMessageService, NzModalService, UploadChangeParam, UploadFile} from "ng-zorro-antd";
import {EruptApiModel, Status} from "../../model/erupt-api.model";

@Component({
    selector: "app-excel-import",
    templateUrl: "./excel-import.component.html",
    styles: []
})
export class ExcelImportComponent implements OnInit {

    @Input() url: string;
    @Input() eruptModel:EruptModel;
    @Input() param: {};


    upload: boolean = false;

    fileList = [];

    errorText: string;

    constructor(public dataService: DataService,
                @Inject(NzModalService)
                private modal: NzModalService,
                @Inject(NzMessageService) private msg: NzMessageService,
                @Inject(DA_SERVICE_TOKEN) public tokenService: TokenService) {
    }

    ngOnInit() {
    }


    upLoadNzChange(param: UploadChangeParam) {
        const file = param.file;
        this.errorText = null;
        if (file.status === "done") {
            if ((<EruptApiModel>file.response).status == Status.ERROR) {
                this.errorText = file.response.message;
                this.fileList = [];
            } else {
                this.upload = true;
                this.msg.success("导入成功");
            }
        } else if (file.status === "error") {
            this.errorText = file.error.error.message;
            this.fileList = [];
        }
    }

}
