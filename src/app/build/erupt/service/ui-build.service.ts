import { EruptBuildModel } from '../model/erupt-build.model';
import { STColumn, STData, STColumnBadge, STColumnBadgeValue, STColumnSource } from '@delon/abc';
import { DateEnum, EditType, ViewType } from '../model/erupt.enum';
import { ViewTypeComponent } from '../components/view-type/view-type.component';
import { MarkdownComponent } from '../components/markdown/markdown.component';
import { CodeEditorComponent } from '../components/code-editor/code-editor.component';
import { DataService } from '@shared/service/data.service';
import { Inject, Injectable } from '@angular/core';
import { ModalOptionsForService, NzMessageService, NzModalService } from 'ng-zorro-antd';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { Column, VL } from '../model/erupt-field.model';

@Injectable()
export class UiBuildService {
    constructor(
        @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
        @Inject(NzModalService) private modal: NzModalService,
        @Inject(NzMessageService) private msg: NzMessageService
    ) {}

    getBadgeFromChoice(map: Map<String, VL>): STColumnBadge {
        let badge: STColumnBadge = {};
        map.forEach((vl) => {
            badge[vl.value] = { text: vl.label, color: 'default' };
        });
        return badge;
    }

    /**
     * 将view数据转换为alain table组件配置信息
     * @param eruptBuildModel ebm
     * @param lineData
     *     true   数据形式为一整行txt
     *     false  数据形式为：带有层级的json
     * @param dataConvert 是否需要数据转换,如bool转换，choice转换
     */
    viewToAlainTableConfig(eruptBuildModel: EruptBuildModel, lineData: boolean): STColumn[] {
        let cols: STColumn[] = [];
        const columns = eruptBuildModel.eruptModel.tableColumns;
        for (let column of columns) {
            let titleWidth = column.title.text.length * 14 + 22;
            if (titleWidth > 280) {
                titleWidth = 280;
            }
            if (column.sort) {
                titleWidth += 20;
            }
            if (column.title.desc) {
                titleWidth += 16;
            }
            column.width = titleWidth;
            //展示类型
            if (column.type === 'link') {
                column.className += ' ';
                column.className += column.link.className;

                column.format = (item: any) => {
                    if (item[column.index]) {
                        if (column.link.viewType === ViewType.IMAGE) {
                            let img = (<string>item[column.index]).split('|')[0];
                            return `<img width="100%" class="text-center" src="${DataService.previewAttachment(
                                img
                            )}" />`;
                        } else if (ViewType.IMAGE_BASE64 == column.link.viewType) {
                            return `<img width="100%" src="${item[column.index]}" />`;
                        }

                        return "<i class='fa " + getLinkColumnIcon(column) + "' aria-hidden='true'></i>";
                    } else {
                        return '';
                    }
                };

                column.click = (item) => {
                    switch (column.link.viewType) {
                        case ViewType.LINK:
                            window.open(item[column.index]);
                            break;
                        case ViewType.DOWNLOAD:
                            window.open(DataService.downloadAttachment(item[column.index]));
                            break;
                        case ViewType.ATTACHMENT:
                            window.open(DataService.previewAttachment(item[column.index]));
                            break;
                        default:
                            this.modal.create(getLinkColumnModelOptions(column, item, eruptBuildModel));
                            break;
                    }
                };
            }

            if (column.template) {
                column.format = (item: any) => {
                    try {
                        let value = item[column.index];
                        return eval(column.template);
                    } catch (e) {
                        console.error(e);
                        this.msg.error(e.toString());
                    }
                };
            }
            cols.push(column);
        }
        return cols;
    }
}
function getLinkColumnModelOptions(
    column: Column,
    item: any,
    eruptBuildModel: EruptBuildModel
): ModalOptionsForService {
    let modelOptions: ModalOptionsForService = {
        nzTitle: column.title.text,
        nzMaskClosable: true,
        nzKeyboard: true,
        nzFooter: null,
        nzContent: ViewTypeComponent,
        nzComponentParams: {
            value: item[column.index],
            view: column,
        },
    };
    switch (column.link.viewType) {
        case ViewType.LINK_DIALOG:
            modelOptions.nzWrapClassName = 'modal-lg modal-body-nopadding';
            modelOptions.nzStyle = { top: '20px' };
            modelOptions.nzMaskClosable = false;
            column.link.icon = '';
            break;
        case ViewType.QR_CODE:
            modelOptions.nzWrapClassName = 'modal-sm';
            column.link.icon = '';
            break;
        case ViewType.MARKDOWN:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzStyle = { top: '24px' };
            modelOptions.nzBodyStyle = { padding: '0' };
            modelOptions.nzContent = MarkdownComponent;
            column.link.icon = '';
            break;
        case ViewType.CODE:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzBodyStyle = { padding: '0' };
            modelOptions.nzContent = CodeEditorComponent;
            modelOptions.nzComponentParams.height = 500;
            modelOptions.nzComponentParams.readonly = true;
            modelOptions.nzComponentParams.language = column.link.language;
            modelOptions.nzComponentParams.edit = { $value: item[column.index] };
            break;
        case ViewType.MAP:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzBodyStyle = { padding: '0' };
            break;
        case ViewType.IMAGE:
            column.width = '90px';
            column.className += ' p-sm';
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzStyle = { top: '50px' };
            break;
        case ViewType.HTML:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzStyle = { top: '50px' };
            modelOptions.nzBodyStyle = { padding: '0' };
            break;
        case ViewType.MOBILE_HTML:
            modelOptions.nzWrapClassName = 'modal-xs';
            break;
        case ViewType.SWF:
            modelOptions.nzWrapClassName = 'modal-lg modal-body-nopadding';
            modelOptions.nzStyle = { top: '40px' };
            break;
        case ViewType.IMAGE_BASE64:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzStyle = { top: '50px', textAlign: 'center' };
            break;
        case ViewType.ATTACHMENT_DIALOG:
            modelOptions.nzWrapClassName = 'modal-lg modal-body-nopadding';
            modelOptions.nzStyle = { top: '30px' };
            break;
        case ViewType.TAB_VIEW:
            modelOptions.nzWrapClassName = 'modal-lg';
            modelOptions.nzStyle = { top: '50px' };
            modelOptions.nzComponentParams.value = item[eruptBuildModel.eruptModel.eruptJson.primaryKeyCol];
            modelOptions.nzComponentParams.eruptBuildModel = eruptBuildModel;

            break;
        default:
            column.width = null;
            break;
    }
    return modelOptions;
}

function getLinkColumnIcon(column: Column) {
    if (column.link.icon) return column.link.icon;
    switch (column.link.viewType) {
        case ViewType.LINK_DIALOG:
            return 'fa-dot-circle-o';
        case ViewType.QR_CODE:
            return 'fa-qrcode';
        case ViewType.MARKDOWN:
            return 'fa-file-text';
        case ViewType.CODE:
            return 'fa-code';
        case ViewType.MAP:
            return 'fa-map';
        case ViewType.HTML:
            return 'fa-file-text';
        case ViewType.MOBILE_HTML:
            return 'fa-file-text';
        case ViewType.SWF:
            return 'fa-file-image-o';
        case ViewType.ATTACHMENT:
            return 'fa-window-restore';
        case ViewType.ATTACHMENT_DIALOG:
            return 'fa-dot-circle-o';
        case ViewType.DOWNLOAD:
            return 'fa-download';
        case ViewType.TAB_VIEW:
            return 'fa-adjust';
        default:
            return 'fa-link';
    }
}
