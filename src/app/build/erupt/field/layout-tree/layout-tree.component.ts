import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EruptModel} from "../../model/erupt.model";
import {DataService} from "@shared/service/data.service";
import {DataHandlerService} from "../../service/data-handler.service";
import {NzFormatEmitEvent} from "ng-zorro-antd";

@Component({
    selector: 'layout-tree',
    templateUrl: './layout-tree.component.html',
    styles: []
})
export class LayoutTreeComponent implements OnInit {

    constructor(private data: DataService,
                private dataHandler: DataHandlerService) {
    }

    @Input() eruptModel: EruptModel;

    @Output() trigger = new EventEmitter();

    searchValue: string;

    treeLoading: boolean;

    list: any;

    ww = window.document.documentElement.clientHeight;

    ngOnInit() {
        this.treeLoading = true;
        this.data.queryReferenceTreeData(this.eruptModel.eruptName, this.eruptModel.eruptJson.layoutTree)
            .subscribe(tree => {
                this.list = this.dataHandler.dataTreeToZorroTree(tree);
                this.treeLoading = false;
            });
    }

    nzDblClick(event: NzFormatEmitEvent) {
        event.node.isExpanded = !event.node.isExpanded;
        event.event.stopPropagation();
    }

    nodeClickEvent(event: NzFormatEmitEvent): void {
        if (event.node.origin.selected) {

            this.trigger.emit({
                [this.eruptModel.eruptJson.layoutTree]: {
                    [this.eruptModel.eruptFieldModelMap.get(this.eruptModel.eruptJson.layoutTree)
                        .eruptFieldJson.edit.referenceTreeType.id
                        ]: event.node.origin.key
                }
            });
        } else {
            this.trigger.emit(null);
        }

        // this.data.queryEruptDataById(this.eruptBuildModel.eruptModel.eruptName, this.currentKey).subscribe(data => {
        //     this.loading = false;
        //     this.dataHandler.objectToEruptValue(data, this.eruptBuildModel);
        // });
    }

}
