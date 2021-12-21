import { Component, HostListener } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
    selector: 'header-storage',
    template: `
        <i nz-icon nzType="tool"></i>
        清除本地缓存
    `,
})
export class HeaderStorageComponent {
    constructor(private confirmServ: NzModalService, private messageServ: NzMessageService) {}

    @HostListener('click')
    _click() {
        this.confirmServ.confirm({
            nzTitle: 'Make sure clear all local storage?',
            nzOnOk: () => {
                localStorage.clear();
                this.messageServ.success('Clear Finished!');
            },
        });
    }
}
