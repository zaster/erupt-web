import { Component, EventEmitter, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '@shared/service/data.service';
import { EruptModel, Power } from '../../model/erupt.model';

import { ALAIN_I18N_TOKEN, DrawerHelper, ModalHelper, SettingsService } from '@delon/theme';
import { EditTypeComponent } from '../../components/edit-type/edit-type.component';
import { EditComponent } from '../edit/edit.component';
import { STChange, STChangeType, STColumn, STColumnButton, STComponent, STData } from '@delon/abc';
import { ActivatedRoute, RouterLinkWithHref } from '@angular/router';
import {
    ModalButtonOptions,
    ModalOptions,
    ModalOptionsForService,
    NzMessageService,
    NzModalRef,
    NzModalService,
} from 'ng-zorro-antd';
import { DA_SERVICE_TOKEN, TokenService } from '@delon/auth';
import { EruptBuildModel } from '../../model/erupt-build.model';
import { OperationEruptMode, OperationMode, OperationType, RestPath, Scene, SelectMode } from '../../model/erupt.enum';
import { DataHandlerService } from '../../service/data-handler.service';
import { ExcelImportComponent } from '../../components/excel-import/excel-import.component';
import { BuildConfig } from '../../model/build-config';
import { EruptApiModel, Status } from '../../model/erupt-api.model';
import { Action, EruptFieldModel, ModalButton } from '../../model/erupt-field.model';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { EruptIframeComponent } from '@shared/component/iframe.component';
import { UiBuildService } from '../../service/ui-build.service';
import { I18NService } from '@core';
import { isDate } from 'util';
import { Expression, QueryCondition, Relation } from '../../model/erupt.vo';
import { ExpectedConditions } from 'protractor';
import { colRules } from '@shared/model/util.model';
import { link } from 'fs';

@Component({
    selector: 'erupt-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.less'],
})
export class TableComponent implements OnInit {
    constructor(
        public settingSrv: SettingsService,
        private dataService: DataService,
        private modalHelper: ModalHelper,
        private drawerHelper: DrawerHelper,
        @Inject(NzMessageService)
        private msg: NzMessageService,
        @Inject(NzModalService)
        private modal: NzModalService,
        public route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
        private dataHandler: DataHandlerService,
        private uiBuildService: UiBuildService,
        @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
    ) {}

    @ViewChild('st', { static: false })
    st: STComponent;

    operationMode = OperationMode;

    showColCtrl: boolean = false;

    deleting: boolean = false;

    clientWidth = document.body.clientWidth;

    hideCondition = false;

    searchErupt: EruptModel;

    eruptBuildModel: EruptBuildModel;

    stConfig = new BuildConfig().stConfig;

    selectedRows: any[] = [];

    columns: STColumn[];

    linkTree: boolean = false;

    selectMode: SelectMode = SelectMode.checkbox;

    showTable: boolean = true;

    _drill: { erupt: string; code: string; parent: EruptBuildModel; val: STData };

    adding: boolean = false; //新增行为防抖

    @Input() set drill(drill: { erupt: string; code: string; parent: EruptBuildModel; val: STData }) {
        this._drill = drill;
        this.init(
            this.dataService.getEruptBuild(drill.erupt),
            {
                url:
                    RestPath.data +
                    '/' +
                    drill.parent.eruptModel.eruptName +
                    '/drill/' +
                    drill.code +
                    '/' +
                    drill.val[drill.parent.eruptModel.eruptJson.primaryKeyCol],
                header: {
                    erupt: drill.parent.eruptModel.eruptName,
                },
            },
            (eb: EruptBuildModel) => {}
        );
    }

    _reference: { eruptBuild: EruptBuildModel; eruptField: EruptFieldModel; mode: SelectMode };

    @Input() set referenceTable(reference: {
        eruptBuild: EruptBuildModel;
        eruptField: EruptFieldModel;
        mode: SelectMode;
        parentEruptName?: string;
        dependVal?: any;
        tabRef: boolean;
    }) {
        this._reference = reference;
        this.selectMode = reference.mode;
        this.init(
            this.dataService.getEruptBuildByField(
                reference.eruptBuild.eruptModel.eruptName,
                reference.eruptField.fieldName,
                reference.parentEruptName
            ),
            {
                url:
                    RestPath.data +
                    '/' +
                    reference.eruptBuild.eruptModel.eruptName +
                    '/reference-table/' +
                    reference.eruptField.fieldName +
                    '?tabRef=' +
                    reference.tabRef +
                    (reference.dependVal ? '&dependValue=' + reference.dependVal : ''),
                header: {
                    erupt: reference.eruptBuild.eruptModel.eruptName,
                    eruptParent: reference.parentEruptName || '',
                },
            },
            (eb: EruptBuildModel) => {
                let erupt = eb.eruptModel.eruptJson;
                erupt.rowOperation = [];
                erupt.drills = [];
                erupt.power.add = false;
                erupt.power.delete = false;
                erupt.power.importable = false;
                erupt.power.edit = false;
                erupt.power.export = false;
                erupt.power.viewDetails = false;
            }
        );
    }

    @Input() set eruptName(value: string) {
        this.init(this.dataService.getEruptBuild(value), {
            url: RestPath.data + '/table/' + value,
            header: {
                erupt: value,
            },
        });
    }
    private _actionLink: {
        fromErupt: EruptBuildModel;
        fromValue: STData;
        fromIds: string[];
        relations: Relation[];
        conditions: QueryCondition[];
        eruptName: string;
        power: Power;
        erupt: EruptBuildModel;
        behavior: 'add' | 'edit';
    };

    @Input() set actionLink(al: {
        fromErupt: EruptBuildModel;
        fromValue: STData;
        fromIds: string[];
        relations: Relation[];
        conditions: QueryCondition[];
        eruptName: string;
        power: Power;
        erupt: EruptBuildModel;
        behavior: 'add' | 'edit';
    }) {
        this._actionLink = al;
        this.init(
            this.dataService.getEruptBuild(this._actionLink.erupt.eruptModel.eruptName),
            {
                url: RestPath.data + '/table/' + this._actionLink.erupt.eruptModel.eruptName,
                header: {
                    erupt: this._actionLink.erupt.eruptModel.eruptName,
                },
                conditions: this._actionLink.conditions,
            },
            (eb: EruptBuildModel) => {}
        );
    }

    ngOnInit() {}

    init(
        observable: Observable<EruptBuildModel>,
        req: {
            url: string;
            header: any;
            conditions?: QueryCondition[];
        },
        callback?: Function
    ) {
        this.selectedRows = [];
        this.showTable = true;
        this.adding = false;
        this.eruptBuildModel = null;
        if (this.searchErupt) {
            this.searchErupt.eruptFieldModels = [];
        }
        //put table api header
        this.stConfig.req.headers = req.header;
        this.stConfig.url = req.url;
        this.stConfig.req.params['relation'] = req.conditions;
        observable.subscribe((eb) => {
            let dt = eb.eruptModel.eruptJson.linkTree;
            this.linkTree = !!dt;
            if (dt) {
                this.showTable = !dt.dependNode;
            }
            this.dataHandler.initErupt(eb);
            callback && callback(eb);
            this.eruptBuildModel = eb;
            this.buildTableConfig();
            this.searchErupt = this.dataHandler.buildSearchErupt(this.eruptBuildModel);
            console.log(this.searchErupt);
        });
    }

    query() {
        let conditions: QueryCondition[] = this.dataHandler.eruptObjectToCondition(
            this.dataHandler.searchEruptToObject({
                eruptModel: this.searchErupt,
            })
        );
        let linkTree = this.eruptBuildModel.eruptModel.eruptJson.linkTree;
        if (linkTree && linkTree.field && linkTree.value) {
            const treeIds = this.getAllChildrenIds(linkTree.value.origin.data);
            this.stConfig.req.params['linkTreeVal'] = treeIds.join(',');
        }
        this.stConfig.req.params['condition'] = conditions;

        this.st.load(1, this.stConfig.req.params);
    }

    getAllChildrenIds(treeNode: any) {
        let treeIds = [];
        treeIds.push(treeNode.id);
        const that = this;
        if (treeNode.children) {
            treeNode.children.forEach((e) => {
                treeIds = treeIds.concat(that.getAllChildrenIds(e));
            });
        }
        return treeIds;
    }
    buildTableConfig() {
        const _columns: STColumn[] = [];
        const that = this;
        const power = this.eruptBuildModel.power;
        _columns.push({
            title: '',
            width: '50px',
            type: this.selectMode,
            fixed: 'left',
            className: 'text-center left-sticky-checkbox',
            index: this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol,
        });
        _columns.push({
            title: '序号',
            width: 30,
            type: 'no',
            className: 'text-center',
            fixed: 'left',
        });
        let viewCols = this.uiBuildService.viewToAlainTableConfig(this.eruptBuildModel, true);
        for (let viewCol of viewCols) {
            viewCol.iif = () => {
                return viewCol.show;
            };
        }
        _columns.push(...viewCols);
        const tableOperators: STColumnButton[] = [];
        if (power.viewDetails) {
            tableOperators.push({
                text: '查看',
                icon: 'eye',
                click: (record: any, modal: any) => {
                    let modalSize = 'modal-lg';
                    if (this.eruptBuildModel.tabErupts) {
                        modalSize = 'modal-xxl';
                    }
                    const col = this.eruptBuildModel.tabErupts ? colRules[4] : colRules[3];
                    this.modal.create({
                        nzWrapClassName: modalSize,
                        nzStyle: { top: '20px' },
                        nzMaskClosable: true,
                        nzKeyboard: true,
                        nzCancelText: this.i18n.fanyi('global.close') + '（ESC）',
                        nzOkText: null,
                        nzTitle: this.i18n.fanyi('global.view'),
                        nzContent: EditComponent,
                        nzComponentParams: {
                            readonly: true,
                            col1: col,
                            eruptBuildModel: this.eruptBuildModel,
                            id: record[this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol],
                            behavior: Scene.EDIT,
                        },
                    });
                },
            });
        }
        if (power.edit) {
            tableOperators.push({
                text: '编辑',
                icon: 'edit',
                iif: (item) => {
                    return that.evalIfExpr(power.ifExpr, item);
                },
                click: (record: any) => {
                    let modalSize = 'modal-lg';
                    if (this.eruptBuildModel.tabErupts) {
                        modalSize = 'modal-xxl';
                    }
                    const col = this.eruptBuildModel.tabErupts ? colRules[4] : colRules[3];
                    const model = this.modal.create({
                        nzWrapClassName: modalSize,
                        nzStyle: { top: '20px' },
                        nzMaskClosable: false,
                        nzKeyboard: false,
                        nzTitle: this.i18n.fanyi('global.editor'),
                        nzOkText: this.i18n.fanyi('global.update'),
                        nzContent: EditComponent,
                        nzComponentParams: {
                            col1: col,
                            eruptBuildModel: this.eruptBuildModel,
                            id: record[this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol],
                            behavior: Scene.EDIT,
                        },
                        nzOnOk: async () => {
                            let validateResult = model.getContentComponent().beforeSaveValidate();
                            if (validateResult) {
                                let obj = this.dataHandler.eruptValueToObject(this.eruptBuildModel);
                                let res = await this.dataService
                                    .editEruptData(this.eruptBuildModel.eruptModel.eruptName, obj)
                                    .toPromise()
                                    .then((res) => res);
                                if (res.status === Status.SUCCESS) {
                                    this.msg.success(this.i18n.fanyi('global.update.success'));
                                    this.st.reload();
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        },
                    });
                },
            });
        }
        if (power.delete) {
            tableOperators.push({
                text: this.i18n.fanyi('table.delete'),
                icon: {
                    type: 'delete',
                    theme: 'twotone',
                    twoToneColor: '#f00',
                },
                pop: this.i18n.fanyi('table.delete.hint'),
                type: 'del',
                iif: (item) => {
                    return this.evalIfExpr(power.ifExpr, item, power.delete);
                },
                click: (record) => {
                    this.dataService
                        .deleteEruptData(
                            this.eruptBuildModel.eruptModel.eruptName,
                            record[this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol]
                        )
                        .subscribe((result) => {
                            if (result.status === Status.SUCCESS) {
                                if (this.st._data.length == 1) {
                                    this.st.load(this.st.pi == 1 ? 1 : this.st.pi - 1);
                                } else {
                                    this.st.reload();
                                }
                                this.msg.success(this.i18n.fanyi('global.delete.success'));
                            }
                        });
                },
            });
        }
        let width = tableOperators.length * 40 + 8;
        for (let action of this.eruptBuildModel.eruptModel.eruptJson.actions) {
            action.contentErupt = this.eruptBuildModel.actionErupts
                ? this.eruptBuildModel.actionErupts[action.code]
                : null;
            if (action.rowMode === 'NONE') {
                action.show = this.evalIfExpr(action.ifExpr, null);
                continue;
            }
            if (action.type !== 'none') {
                action.iif = (item) => {
                    action.show = this.evalIfExpr(action.ifExpr, item);
                    return action.show;
                };
            }
            if (action.contentType === 'none') {
                //按钮确认信息
                if (action.pop) action.pop = this.i18n.fanyi('' + action.pop);
                else action.pop = false;
            } else {
                action.pop = false;
            }
            action.click = (record) => {
                this.createAction(action, record);
            };
            width += action.text.length * 10;
            tableOperators.push(action);
        }
        console.log(width);
        //drill

        if (tableOperators.length > 0) {
            _columns.push({
                title: this.i18n.fanyi('table.operation'),
                fixed: 'right',
                width: width,
                className: 'text-center',
                buttons: tableOperators,
            });
        }
        this.columns = _columns;
    }
    getActionContent(name: string) {
        switch (name) {
            case 'form':
                return EditComponent;
            case 'table':
                return TableComponent;
            case 'tpl':
                return EruptIframeComponent;
            case 'importx':
                return ExcelImportComponent;
            case 'none':
                return null;
        }
    }
    getModalOperatorExecuteParams(action: Action, record: STData, content: TableComponent) {
        const em = this.eruptBuildModel.eruptModel;
        const contentErupt = action.contentErupt.eruptModel;

        const param = {
            dependency: {
                from: {
                    eruptName: this._actionLink ? this._actionLink.fromErupt.eruptModel.eruptName : null,
                    ids: this._actionLink ? this._actionLink.fromIds : null,
                },
                eruptName: em.eruptName,
                ids: this.getSelectedTableRowIds(em.eruptJson.primaryKeyCol, record),
            },
            content: {
                eruptName: contentErupt.eruptName,
                ids: null,
                formValue: null,
            },
        };
        if (action.contentType === 'table') {
            param.content.ids = content.getSelectedTableRowIds(contentErupt.eruptJson.primaryKeyCol, null);
            if (!param.content.ids || param.content.ids.length === 0) {
                this.msg.warning(this.i18n.fanyi('table.require.select_one'));
                return null;
            }
        } else if (action.contentType === 'form') {
            const eruptValue = this.dataHandler.eruptValueToObject(action.contentErupt);
            param.content.formValue = eruptValue;
        }
        return param;
    }
    createModalActionButton(action: Action, button: ModalButton, record: STData): ModalButtonOptions {
        button.danger = true;
        button.show = this.evalIfExpr(button.ifExpr, record); //button.ifExpr ? eval(button.ifExpr) : true;
        const that = this;
        button.onClick = async function (this: ModalButtonOptions<any>, contentComponent: any) {
            that.selectedRows = [];
            that.executeAction(that.eruptBuildModel.eruptModel.eruptName, action, button, record);
        };
        return button;
    }

    async executeAction(eruptName: string, action: Action, button: ModalButton, record: STData) {
        let content;
        if (button && button.modalRef) {
            content = button.modalRef.getContentComponent();
        }
        const params = this.getModalOperatorExecuteParams(action, record, content);
        if (!params) return false;
        const modalRef = button.modalRef;
        let res = await this.dataService
            .executeAction(eruptName, action.code, button.code, params)
            .toPromise()
            .then((res) => res);
        if (res.status === Status.SUCCESS) {
            this.st.reload();
            if (modalRef) modalRef.getInstance().close(true);
        } else {
            return !modalRef;
        }
    }

    getSelectedTableRowIds(rowIdName: string, record: STData): string[] {
        let ids = [];
        //先找选中的数据
        this.selectedRows.forEach((e) => {
            ids.push(e[rowIdName]);
        });
        //如果是在数据行的则选中的是当前行，否则为checkbox或者radio选中的行
        ids = record ? [record[rowIdName]] : ids;
        return ids;
    }
    createAction(action: Action, record: STData) {
        const eruptModel = this.eruptBuildModel.eruptModel;
        if (!action.contentErupt) action.contentErupt = this.eruptBuildModel;
        const options: ModalOptionsForService = {
            nzKeyboard: true,
            nzTitle: '' + action.text,
            nzStyle: { top: '20px' },
            nzContent: this.getActionContent(action.contentType),
            nzComponentParams: this.getActionContentInitParams(action, record),
            nzMaskClosable: false,
        };
        if (action.contentType !== 'none')
            options.nzWrapClassName =
                action.contentType === 'table' || action.contentErupt.tabErupts ? 'modal-xxl' : 'modal-lg';

        //如果行为是行数据依赖的，那么提醒选择数据
        if (
            action.rowMode !== 'NONE' &&
            this.getSelectedTableRowIds(eruptModel.eruptJson.primaryKeyCol, record).length === 0
        ) {
            this.msg.warning(this.i18n.fanyi('table.require.select_one'));
            return;
        }
        let buttons = action.buttons;
        let tempButtons = buttons;
        //如果按钮只有一个，那么ok按钮执行逻辑，否则自定义按钮
        if (buttons.length === 0) options.nzFooter = null;
        else if (buttons.length === 1) {
            options.nzOnOk = () => {
                return this.executeAction(this.eruptBuildModel.eruptModel.eruptName, action, buttons[0], record);
            };
            options.nzCancelText = this.i18n.fanyi('global.close') + '（ESC）';
        } else {
            options.nzFooter = null;
            const footer = [];
            buttons.forEach((button) => {
                footer.push(this.createModalActionButton(action, button, record));
            });
            const closeButton: ModalButton = {
                label: this.i18n.fanyi('global.close') + '（ESC）',
                onClick: () => {
                    const modalRef = closeButton.modalRef;
                    if (modalRef) modalRef.getInstance().close(true);
                },
            };
            tempButtons = tempButtons.concat(closeButton);

            footer.push(closeButton);
            options.nzFooter = footer;
        }
        if (action.contentType === 'none') {
            options.nzContent = this.i18n.fanyi('table.hint.operation');
            this.modal.confirm(options);
        } else {
            let modal = this.modal.create(options);
            tempButtons.forEach((button) => {
                button.modalRef = modal;
            });
        }
    }
    getActionContentInitParams(action: Action, record: STData): Partial<any> {
        const ids = this.getSelectedTableRowIds(this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol, record);
        if (action.contentType === 'tpl')
            return {
                url: this.dataService.getEruptActionTpl(this.eruptBuildModel.eruptModel.eruptName, action.code, ids),
            };
        else if (action.contentType === 'importx') {
            const em = this._actionLink.fromErupt.eruptModel;
            let paramData = this.getModalOperatorExecuteParams(action, record, null);
            return {
                eruptModel: this.eruptBuildModel.eruptModel,
                url:
                    RestPath.data +
                    '/' +
                    this.eruptBuildModel.eruptModel.eruptName +
                    '/action/' +
                    action.code +
                    '/importx/',
                param: paramData,
            };
        } else if (action.contentType === 'form') {
            const col = action.contentErupt.tabErupts ? colRules[4] : colRules[3];
            return {
                readonly: true,
                col1: col,
                eruptBuildModel: this.eruptBuildModel,
                id: record[this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol],
                behavior: Scene.EDIT,
            };
        } else if (action.contentType === 'table') {
            const conditions: QueryCondition[] = [];
            if (action.relations)
                action.relations.forEach((relation) => {
                    conditions.push({
                        key: relation.key,
                        value: relation.value ? relation.value : record[relation.recordKey],
                        expression: Expression.EQ,
                    });
                });

            const param = {
                actionLink: {
                    fromErupt: this.eruptBuildModel,
                    fromValue: record,
                    fromIds: ids,
                    power: action.power,
                    erupt: action.contentErupt,
                    relations: action.relations,
                    conditions: conditions,
                    behavior: action.formMode,
                    actionLink: this._actionLink,
                },
            };
            return param;
        }
    }

    //新增
    addRow() {
        let modalSize = 'modal-lg';
        if (this.eruptBuildModel.tabErupts) {
            modalSize = 'modal-xxl';
        }
        const col = this.eruptBuildModel.tabErupts ? colRules[4] : colRules[3];
        const modal = this.modal.create({
            nzStyle: { top: '20px' },
            nzWrapClassName: modalSize,
            nzMaskClosable: false,
            nzKeyboard: false,
            nzTitle: this.i18n.fanyi('global.new'),
            nzContent: EditComponent,
            nzComponentParams: {
                eruptBuildModel: this.eruptBuildModel,
                col1: col,
            },
            nzOkText: this.i18n.fanyi('global.add'),
            nzOnOk: async () => {
                if (!this.adding) {
                    this.adding = true;
                    setTimeout(() => {
                        this.adding = false;
                    }, 500);
                    if (modal.getContentComponent().beforeSaveValidate()) {
                        let res: EruptApiModel;
                        let data: { [key: string]: any } = this.dataHandler.eruptValueToObject(this.eruptBuildModel);
                        if (this._actionLink && this._actionLink.fromValue) {
                            this._actionLink.relations.forEach((element) => {
                                let obj = data;
                                element.key.split('.').forEach((v, i, a) => {
                                    obj[v] = i === a.length - 1 ? this._actionLink.fromValue[element.recordKey] : {};
                                    obj = obj[v];
                                });
                            });
                        }
                        console.log(data);
                        let header = {};
                        if (this.linkTree) {
                            let lt = this.eruptBuildModel.eruptModel.eruptJson.linkTree;
                            if (lt.dependNode && lt.value) {
                                header['link'] = this.eruptBuildModel.eruptModel.eruptJson.linkTree.value.origin.key;
                            }
                        }
                        res = await this.dataService
                            .addEruptData(this.eruptBuildModel.eruptModel.eruptName, data, header)
                            .toPromise()
                            .then((res) => res);
                        if (res.status === Status.SUCCESS) {
                            this.msg.success(this.i18n.fanyi('global.add.success'));
                            this.st.reload();
                            return true;
                        }
                    }
                }
                return false;
            },
        });
    }

    //批量删除
    delRows() {
        if (!this.selectedRows || this.selectedRows.length === 0) {
            this.msg.warning(this.i18n.fanyi('table.select_delete_item'));
            return;
        }
        const ids = [];
        this.selectedRows.forEach((e) => {
            ids.push(e[this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol]);
        });
        if (ids.length > 0) {
            this.modal.confirm({
                nzTitle: this.i18n.fanyi('table.hint_delete_number').replace('{}', ids.length),
                nzContent: '',
                nzOnOk: async () => {
                    this.deleting = true;
                    let res = await this.dataService
                        .deleteEruptDatas(this.eruptBuildModel.eruptModel.eruptName, ids)
                        .toPromise()
                        .then((res) => res);
                    this.deleting = false;
                    if (res.status == Status.SUCCESS) {
                        if (this.selectedRows.length == this.st._data.length) {
                            this.st.load(this.st.pi == 1 ? 1 : this.st.pi - 1);
                        } else {
                            this.st.reload();
                        }
                        this.selectedRows = [];
                        this.msg.success(this.i18n.fanyi('global.delete.success'));
                    }
                },
            });
        } else {
            this.msg.error(this.i18n.fanyi('table.select_delete_item'));
        }
    }

    clearCondition() {
        this.dataHandler.emptyEruptValue({ eruptModel: this.searchErupt });
    }

    // table checkBox 触发事件
    tableDataChange(event: STChange) {
        const power = this.eruptBuildModel.power;
        let that = this;

        if (event.type === 'loaded') {
            power.add = this.evalIfExpr(power.ifExpr, null, power.add);
            power.edit = this.evalIfExpr(power.ifExpr, null, power.edit);
            power.delete = this.evalIfExpr(power.ifExpr, null, power.delete);
            power.importable = this.evalIfExpr(power.ifExpr, null, power.importable);
            power.export = this.evalIfExpr(power.ifExpr, null, power.export);
            power.delete = this.evalIfExpr(power.ifExpr, null, power.delete);
        }
        let rows: STData[];
        if (this._reference) {
            if (this._reference.mode == SelectMode.radio) {
                if (event.type === 'click') {
                    for (let datum of this.st._data) {
                        datum.checked = false;
                    }
                    event.click.item.checked = true;
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = [event.click.item];
                } else if (event.type === 'radio') {
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = [event.radio];
                }
            } else if (this._reference.mode == SelectMode.checkbox) {
                if (event.type === 'checkbox') {
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = event.checkbox;
                }
            }
            rows = this._reference.eruptField.eruptFieldJson.edit.$tempValue;
        } else {
            if (event.type === 'checkbox') {
                power.delete = true;
                this.selectedRows = event.checkbox;
            }
            rows = event.checkbox;
        }

        if (rows) {
            let deletable = true;
            console.log(rows);
            for (let item of rows) {
                deletable = this.evalIfExpr(power.ifExpr, item);
                if (!deletable) {
                    power.delete = deletable;
                }
            }
        }
    }
    evalIfExpr(ifexpr: string, item: STData, second: boolean = true) {
        let depend = this._actionLink && this._actionLink.fromValue ? this._actionLink.fromValue : null;
        if (ifexpr) {
            return eval(ifexpr) && second;
        } else {
            return second;
        }
    }
    downloadExcelTemplate() {
        this.dataService.downloadExcelTemplate(this.eruptBuildModel.eruptModel.eruptName);
    }

    // excel导出
    exportExcel() {
        let condition = null;
        if (this.searchErupt.eruptFieldModels.length > 0) {
            condition = this.dataHandler.eruptObjectToCondition(
                this.dataHandler.eruptValueToObject({
                    eruptModel: this.searchErupt,
                })
            );
        }
        //导出接口
        this.dataService.downloadExcel(this.eruptBuildModel.eruptModel.eruptName, condition);
    }

    clickTreeNode(event) {
        //console.log(event);
        console.log(event);
        this.showTable = true;
        this.eruptBuildModel.eruptModel.eruptJson.linkTree.value = event;
        this.searchErupt.eruptJson.linkTree.value = event;
        console.log(this.searchErupt.eruptJson.linkTree.value);
        this.query();
    }

    // excel导入
    importableExcel() {
        let modalSize = 'modal-lg';
        if (this.eruptBuildModel.tabErupts) {
            modalSize = 'modal-xxl';
        }
        let model = this.modal.create({
            nzKeyboard: true,
            nzTitle: 'Excel ' + this.i18n.fanyi('table.import'),
            nzOkText: null,
            nzCancelText: this.i18n.fanyi('global.close') + '（ESC）',
            nzWrapClassName: modalSize,
            nzContent: ExcelImportComponent,
            nzComponentParams: {
                eruptModel: this.eruptBuildModel.eruptModel,
                url: this.dataService.excelImport + this.eruptBuildModel.eruptModel.eruptName,
                param: '{test:test}',
            },
            nzOnCancel: () => {
                if (model.getContentComponent().upload) {
                    this.st.reload();
                }
            },
        });
    }
}
