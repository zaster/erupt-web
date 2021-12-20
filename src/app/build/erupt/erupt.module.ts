import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { DataHandlerService } from './service/data-handler.service';
import { EditTypeComponent } from './components/edit-type/edit-type.component';
import { ViewTypeComponent } from './components/view-type/view-type.component';
import { TabTableComponent } from './components/tab-table/tab-table.component';
import { TreeSelectComponent } from './components/tree-select/tree-select.component';
import { ExcelImportComponent } from './components/excel-import/excel-import.component';
import { ReferenceTableComponent } from './components/reference-table/reference-table.component';
import { CkeditorComponent } from './components/ckeditor/ckeditor.component';
import { AmapComponent } from './components/amap/amap.component';
import { EruptRoutingModule } from './erupt-routing.module';
import { TreeComponent } from './view/tree/tree.component';
import { TableViewComponent } from './view/table-view/table-view.component';
import { EditComponent } from './view/edit/edit.component';
import { TableComponent } from './view/table/table.component';
import { LayoutTreeComponent } from './view/layout-tree/layout-tree.component';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { UEditorModule } from 'ngx-ueditor';
import { UeditorComponent } from './components/ueditor/ueditor.component';
import { TabTreeComponent } from './components/tab-tree/tab-tree.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { SafeTemplateComponent } from './components/safe-template/safe-template.component';
import { DateComponent } from './components/date/date.component';
import { MarkdownComponent } from './components/markdown/markdown.component';
import { UiBuildService } from './service/ui-build.service';
import { ChoiceComponent } from './components/choice/choice.component';
import { TagsComponent } from './components/tags/tags.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        HttpClientModule,
        EruptRoutingModule,
        NzCodeEditorModule,
        UEditorModule.forRoot({
            js: ['./assets/ueditor/ueditor.config.js', './assets/ueditor/ueditor.all.min.js'],
            // 默认前端配置项
            options: {
                UEDITOR_HOME_URL: './assets/ueditor/',
            },
        }),
    ],
    providers: [DataHandlerService, UiBuildService],
    exports: [EditTypeComponent, ViewTypeComponent, TabTableComponent],
    declarations: [
        EditTypeComponent,
        TreeSelectComponent,
        CkeditorComponent,
        TabTableComponent,
        AmapComponent,
        ExcelImportComponent,
        ReferenceTableComponent,
        ViewTypeComponent,
        EditComponent,
        TreeComponent,
        TableViewComponent,
        TableComponent,
        LayoutTreeComponent,
        CodeEditorComponent,
        UeditorComponent,
        TabTreeComponent,
        CheckboxComponent,
        SafeTemplateComponent,
        DateComponent,
        MarkdownComponent,
        ChoiceComponent,
        TagsComponent,
    ],
})
export class EruptModule {}
