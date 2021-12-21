

import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlainThemeModule } from '@delon/theme';
import { TranslateModule } from '@ngx-translate/core';
import { EruptPageHeaderComponent } from './component/erupt-page-header.component';
import { I18nComponent } from './component/i18n.component';
import { EruptIframeComponent } from './component/iframe.component';
import { RipperDirective } from './directive/ripper.directive';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import { SafeScriptPipe } from './pipe/safe-script.pipe';
import { SafeUrlPipe } from './pipe/safe-url.pipe';
import { DataService } from './service/data.service';

import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

// #region third libs
// import { NgxTinymceModule } from 'ngx-tinymce';
// import { UEditorModule } from 'ngx-ueditor';

const THIRDMODULES: Array<Type<any>> = [];
// #endregion
const COMPONENTS: Array<Type<any>> = [
    SafeUrlPipe,
    SafeHtmlPipe,
    SafeScriptPipe,
    EruptIframeComponent,
    EruptPageHeaderComponent,
    I18nComponent,
];

// #region your componets & directives
const DIRECTIVES: Array<Type<any>> = [];
// #endregion

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        AlainThemeModule.forChild(),
        ...SHARED_DELON_MODULES,
        ...SHARED_ZORRO_MODULES,
        // third libs
        ...THIRDMODULES,
    ],
    declarations: [
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        RipperDirective,
    ],
    providers: [DataService],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlainThemeModule,
        TranslateModule,
        ...SHARED_DELON_MODULES,
        ...SHARED_ZORRO_MODULES,
        // third libs
        ...THIRDMODULES,
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
    ],
})
export class SharedModule {}
