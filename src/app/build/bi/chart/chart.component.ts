import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Bi, Chart, ChartType } from '../model/bi.model';
import { BiDataService } from '../service/data.service';
import { NzMessageService } from 'ng-zorro-antd';
import { HandlerService } from '../service/handler.service';

@Component({
    selector: 'bi-chart',
    templateUrl: './chart.component.html',
    styles: [],
})
export class ChartComponent implements OnInit, OnDestroy {
    @Input() chart: Chart;

    @Input() bi: Bi;

    @Output() buildDimParam = new EventEmitter();

    chartType = ChartType;

    src: string;

    constructor(
        private ref: ElementRef,
        private biDataService: BiDataService,
        private handlerService: HandlerService,
        @Inject(NzMessageService) private msg: NzMessageService
    ) {}

    ngOnInit() {
        this.init();
    }

    init() {}

    ngOnDestroy(): void {}

    update(loading: boolean) {}

    downloadChart() {}
}
