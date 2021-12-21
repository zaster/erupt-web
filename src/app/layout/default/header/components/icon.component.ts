import { Component } from '@angular/core';

@Component({
    selector: 'header-icon',
    template: `
        <a nz-dropdown nzTrigger="click" nzPlacement="bottomRight" (nzVisibleChange)="change()">
            <div class="alain-default__nav-item" nz-dropdown>
                <i class="appstore-o"></i>
            </div>
            <div nz-menu class="wd-xl animated jello">
                <nz-spin [nzSpinning]="loading" [nzTip]="'正在读取数据...'">
                    <div nz-row [nzType]="'flex'" [nzJustify]="'center'" [nzAlign]="'middle'" class="app-icons">
                        <div nz-col [nzSpan]="6">
                            <i class="calendar bg-error text-white"></i>
                            <small>Calendar</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="file bg-geekblue text-white"></i>
                            <small>Files</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="cloud bg-success text-white"></i>
                            <small>Cloud</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="star-o bg-magenta text-white"></i>
                            <small>Star</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="team bg-purple text-white"></i>
                            <small>Team</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="scan bg-warning text-white"></i>
                            <small>QR</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="pay-circle-o bg-cyan text-white"></i>
                            <small>Pay</small>
                        </div>
                        <div nz-col [nzSpan]="6">
                            <i class="printer bg-grey text-white"></i>
                            <small>Print</small>
                        </div>
                    </div>
                </nz-spin>
            </div>
        </a>
    `,
})
export class HeaderIconComponent {
    loading = true;

    change() {
        setTimeout(() => (this.loading = false), 500);
    }
}
