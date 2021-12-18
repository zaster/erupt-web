import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// delon
import { AlainThemeModule } from '@delon/theme';
import { SafeUrlPipe } from '@shared/pipe/safe-url.pipe';
import { DataService } from '@shared/service/data.service';
import { RipperDirective } from './directive/ripper.directive';
import { EruptPageHeaderComponent } from '@shared/component/erupt-page-header.component';
import { SafeHtmlPipe } from '@shared/pipe/safe-html.pipe';
import { SafeScriptPipe } from '@shared/pipe/safe-script.pipe';
import { EruptIframeComponent } from '@shared/component/iframe.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nComponent } from '@shared/component/i18n.component';
import { NoticeIconModule } from '@delon/abc/notice-icon';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { STModule } from '@delon/abc/st';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ExceptionModule } from '@delon/abc/exception';
import { SidebarNavModule } from '@delon/abc/sidebar-nav';
// #endregion

// #region your componets & directives
const COMPONENTS = [
    SafeUrlPipe,
    SafeHtmlPipe,
    SafeScriptPipe,
    EruptIframeComponent,
    EruptPageHeaderComponent,
    I18nComponent,
];
const DIRECTIVES = [];

// #endregion

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        AlainThemeModule.forChild(),
        CommonModule,
        FormsModule,
        RouterModule,
        NzTabsModule,
        AlainThemeModule.forChild(),
        NoticeIconModule,
        NzDropDownModule,
        NzInputModule,
        NzAutocompleteModule,
        NzGridModule,
        NzSpinModule,
        NzBadgeModule,
        NzAvatarModule,
        NzIconModule,
        NzFormModule,
        NzUploadModule,
        STModule,
        NzCascaderModule,
        NzButtonModule,
        NzCardModule,
        NzTreeModule,
        NzSelectModule,
        NzDrawerModule,
        NzDividerModule,
        NzBackTopModule,
        NzCheckboxModule,
        NzSwitchModule,
        NzAlertModule,
        NzPopoverModule,
        ExceptionModule,
        SidebarNavModule,

        // third libs
    ],
    declarations: [
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        RipperDirective,
    ],
    providers: [DataService],
    entryComponents: [EruptIframeComponent],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlainThemeModule,
        // i18n
        TranslateModule,
        CommonModule,
        FormsModule,
        RouterModule,
        AlainThemeModule.forChild(),
        NoticeIconModule,
        NzDropDownModule,
        NzInputModule,
        NzTabsModule,
        NzAutocompleteModule,
        NzGridModule,
        NzSpinModule,
        NzBadgeModule,
        NzAvatarModule,
        NzIconModule,
        NzFormModule,
        NzUploadModule,
        STModule,
        NzCascaderModule,
        NzButtonModule,
        NzCardModule,
        NzTreeModule,
        NzSelectModule,
        NzDrawerModule,
        NzDividerModule,
        NzBackTopModule,
        NzCheckboxModule,
        NzSwitchModule,
        NzAlertModule,
        NzPopoverModule,
        ExceptionModule,
        SidebarNavModule,
        // third libs
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        RipperDirective,
    ],
})
export class SharedModule {}
