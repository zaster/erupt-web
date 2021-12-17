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
        // third libs
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        RipperDirective,
    ],
})
export class SharedModule {}
