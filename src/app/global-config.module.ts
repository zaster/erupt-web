import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// import { STWidgetRegistry } from '@delon/abc/st';
import { SharedModule } from '@shared/shared.module';
import { AlainConfig, ALAIN_CONFIG, DelonUtilModule } from '@delon/util';
import { AlainThemeModule } from '@delon/theme';
import { STModule } from '@delon/abc';
import { DelonAuthModule } from '@delon/auth';
import { DelonCacheModule } from '@delon/cache';
import { DelonChartModule } from '@delon/chart';
import { RouteReuseStrategy } from '@angular/router';
import { ReuseTabService, ReuseTabStrategy } from '@delon/abc/reuse-tab';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

import { throwIfAlreadyLoaded } from '@core';
import { NZ_DATE_LOCALE } from 'ng-zorro-antd';

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

const alainModules: any[] = [
    AlainThemeModule.forRoot(),
    DelonChartModule,
    DelonAuthModule,
    DelonCacheModule,
    DelonUtilModule,
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
    imports: [...alainModules],
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
