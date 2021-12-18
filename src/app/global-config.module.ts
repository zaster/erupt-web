import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// import { STWidgetRegistry } from '@delon/abc/st';
import { SharedModule } from '@shared/shared.module';
import { AlainConfig, ALAIN_CONFIG, DelonUtilModule } from '@delon/util';
import { STModule } from '@delon/abc/st';
import { SEModule } from '@delon/abc/se';
import { NoticeIconModule } from '@delon/abc/notice-icon';
import { AlainThemeModule } from '@delon/theme';
import { DelonAuthModule } from '@delon/auth';
import { DelonCacheModule } from '@delon/cache';
import { DelonChartModule } from '@delon/chart';
import { RouteReuseStrategy } from '@angular/router';
import { ReuseTabModule, ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { throwIfAlreadyLoaded } from '@core';

// Please refer to: https://ng-alain.com/docs/global-config
// #region NG-ALAIN Config

const alainConfig: AlainConfig = {
    st: {
        size: 'small',
        sortReName: {
            ascend: 'asc',
            descend: 'desc',
        },
        modal: { size: 'lg' },
    },
    pageHeader: { homeI18n: 'home' },
    auth: { login_url: '/passport/login' },
};
const zorroModules: any[] = [
    NzMessageModule,
    NzModalModule,
    NzNotificationModule,
    NzUploadModule,
    NzCarouselModule,
    NzSpinModule,
    NzMenuModule,
    NzButtonModule,
    NzAvatarModule,
    NzTabsModule,
];
const alainModules: any[] = [
    AlainThemeModule.forRoot(),
    DelonChartModule,
    DelonAuthModule,
    DelonCacheModule,
    DelonUtilModule,
    STModule,
    SEModule,

    ReuseTabModule,
    NoticeIconModule,
];
const alainProvides = [
    { provide: ALAIN_CONFIG, useValue: alainConfig },
    {
        provide: RouteReuseStrategy,
        useClass: ReuseTabStrategy,
        deps: [ReuseTabService],
    },
];

// #region reuse-tab
/**
 * 若需要[路由复用](https://ng-alain.com/components/reuse-tab)需要：
 * 1、在 `shared-delon.module.ts` 导入 `ReuseTabModule` 模块
 * 2、注册 `RouteReuseStrategy`
 * 3、在 `src/app/layout/default/default.component.html` 修改：
 *  ```html
 *  <section class="alain-default__content">
 *    <reuse-tab #reuseTab></reuse-tab>
 *    <router-outlet (activate)="reuseTab.activate($event)"></router-outlet>
 *  </section>
 *  ```
 */
// import { RouteReuseStrategy } from '@angular/router';
// import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
// alainProvides.push({
//   provide: RouteReuseStrategy,
//   useClass: ReuseTabStrategy,
//   deps: [ReuseTabService],
// } as any);

// #endregion

// #endregion

// Please refer to: https://ng.ant.design/docs/global-config/en#how-to-use
// #region NG-ZORRO Config

const ngZorroConfig: NzConfig = {};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({
    imports: [...zorroModules, ...alainModules],
})
export class GlobalConfigModule {
    constructor(@Optional() @SkipSelf() parentModule: GlobalConfigModule) {
        throwIfAlreadyLoaded(parentModule, 'GlobalConfigModule');
    }

    static forRoot(): ModuleWithProviders<GlobalConfigModule> {
        return {
            ngModule: GlobalConfigModule,
            providers: [...alainProvides, ...zorroProvides],
        };
    }
}
