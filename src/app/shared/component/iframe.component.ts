import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IframeHeight } from '@shared/util/window.util';

@Component({
    selector: 'erupt-iframe',
    template: `
        <nz-spin [nzSpinning]="spin">
            <iframe
                [src]="url | safeUrl"
                style="width: 100%;border: 0;display: block"
                [ngStyle]="{ height: height }"
                (load)="iframeHeight($event)"
            >
            </iframe>
        </nz-spin>
    `,
    styles: [],
})
export class EruptIframeComponent implements OnInit, OnChanges {
    @Input() url: string;

    @Input() height: string;

    spin: boolean = true;

    constructor() {}

    ngOnInit() {
        this.spin = true;
    }

    iframeHeight(event) {
        this.spin = false;
        if (!this.height) {
            IframeHeight(event);
        }
    }

    ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
        if (!changes.url.firstChange) {
            this.spin = true;
        }
    }
}
