import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IframeHeight } from '@shared/util/window.util';

@Component({
    selector: 'erupt-iframe',
    template: `
        <nz-spin [nzSpinning]="spin">
            <iframe [src]="url|safeUrl" style="width: 100%;border: 0;display: block" [ngStyle]="style"
                    (load)="iframeHeight($event)">

            </iframe>
        </nz-spin>
    `,
    styles: [],
})
export class EruptIframeComponent implements OnInit, OnChanges {
    @Input() url: string;

    @Input() height: string;

    @Input() style: object = {};

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

<<<<<<< HEAD
    ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
=======
    ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
        console.log(changes.url.firstChange);
>>>>>>> a30d1139e74c23b7d60cb2be17f6c480aa3911a8
        if (!changes.url.firstChange) {
            this.spin = true;
        }
    }
}
