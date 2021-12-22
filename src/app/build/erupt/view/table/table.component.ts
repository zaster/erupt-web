import { Component, EventEmitter, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '@shared/service/data.service';
import { EruptModel, Power, RowOperation } from '../../model/erupt.model';

import { ALAIN_I18N_TOKEN, DrawerHelper, ModalHelper, SettingsService } from '@delon/theme';
import { EditTypeComponent } from '../../components/edit-type/edit-type.component';
import { EditComponent } from '../edit/edit.component';
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
import { QueryCondition } from '../../model/erupt.vo';
import { colRules } from '@shared/model/util.model';
import { ActivatedRoute } from '@angular/router';
import { STComponent, STColumn, STData, STColumnButton, STChange } from '@delon/abc/st';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, ModalButtonOptions, ModalOptions } from 'ng-zorro-antd/modal';

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

    @ViewChild('st')
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
    downloading: boolean = false;

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

    @Input() set actionLink(actionLink: {
        fromErupt: EruptBuildModel;
        fromValue: STData;
        conditions: QueryCondition[];
        eruptName: string;
    }) {
        this.actionLink = actionLink;

        this.init(
            this.dataService.getEruptBuild(actionLink.eruptName),
            {
                url: RestPath.data + '/table/' + actionLink.eruptName,
                header: {
                    erupt: actionLink.eruptName,
                },
                conditions: actionLink.conditions,
            },
            (eb: EruptBuildModel) => {}
        );
    }

    ngOnInit() {
        console.log('in table');
    }

    init(
        observable: Observable<EruptBuildModel>,
        req: {
            url: string;
            header: any;
            conditions?: QueryCondition[];
        },
        callback?: Function
    ) {
        console.log('init table');
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
        this.stConfig.req.param['condition'] = req.conditions;
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
        });
    }

    query() {
        const conditions: QueryCondition[] = [];
        conditions
            .concat(
                this.dataHandler.eruptObjectToCondition(
                    this.dataHandler.searchEruptToObject({
                        eruptModel: this.searchErupt,
                    })
                )
            )
            // tslint:disable-next-line: no-non-null-assertion
            .concat(this.actionLink!.conditions);
        this.stConfig.req.param['condition'] = conditions;

        let linkTree = this.eruptBuildModel.eruptModel.eruptJson.linkTree;
        if (linkTree && linkTree.field) {
            this.stConfig.req.param['linkTreeVal'] = linkTree.value;
        }
        this.st.load(1, this.stConfig.req.param);
    }

    buildTableConfig() {
        const _columns: STColumn[] = [];
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
                return true;
            };
        }
        _columns.push(...viewCols);
        const tableOperators: STColumnButton[] = [];
        if (power.viewDetails) {
            tableOperators.push({
                icon: 'eye',
                click: (record: any, modal: any) => {
                    let modalSize = 'modal-lg';
                    if (this.eruptBuildModel.tabErupts) {
                        modalSize = 'modal-xxl';
                    }
                    this.modal.create({
                        nzWrapClassName: modalSize,
                        nzStyle: { top: '60px' },
                        nzMaskClosable: true,
                        nzKeyboard: true,
                        nzCancelText: this.i18n.fanyi('global.close') + '（ESC）',
                        nzOkText: null,
                        nzTitle: this.i18n.fanyi('global.view'),
                        nzContent: EditComponent,
                        nzComponentParams: {
                            readonly: true,
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
                icon: 'edit',
                iif: (item) => {
                    if (power.ifExpr) {
                        let depend = this._drill ? this._drill : null;
                        return eval(power.ifExpr);
                    } else {
                        return true;
                    }
                },
                click: (record: any) => {
                    const model = this.modal.create({
                        nzWrapClassName: 'modal-lg',
                        nzStyle: { top: '60px' },
                        nzMaskClosable: false,
                        nzKeyboard: false,
                        nzTitle: this.i18n.fanyi('global.editor'),
                        nzOkText: this.i18n.fanyi('global.update'),
                        nzContent: EditComponent,
                        nzComponentParams: {
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
                icon: {
                    type: 'delete',
                    theme: 'twotone',
                    twoToneColor: '#f00',
                },
                pop: this.i18n.fanyi('table.delete.hint'),
                type: 'del',
                iif: (item) => {
                    if (power.ifExpr) {
                        let depend = this._drill ? this._drill : null;
                        return eval(power.ifExpr) && power.delete;
                    } else {
                        return power.delete;
                    }
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
        const that = this;
        for (let i in this.eruptBuildModel.eruptModel.eruptJson.rowOperation) {
            let ro = this.eruptBuildModel.eruptModel.eruptJson.rowOperation[i];
            if (ro.mode !== OperationMode.BUTTON) {
                let text = '';
                if (ro.icon) {
                    text = `<i class=\"${ro.icon}\"></i>`;
                } else {
                    text = ro.title;
                }
                tableOperators.push({
                    type: 'link',
                    text: text,
                    tooltip: ro.title + (ro.tip && '(' + ro.tip + ')'),
                    click: (record: any, modal: any) => {
                        that.createOperator(ro, record);
                    },
                    iifBehavior: 'disabled',
                    iif: (item) => {
                        if (ro.ifExpr) {
                            let depend = this._drill ? this._drill : null;
                            ro.show = eval(ro.ifExpr);
                        } else {
                            ro.show = true;
                        }
                        return ro.show;
                    },
                });
            }
        }
        for (let action of this.eruptBuildModel.eruptModel.eruptJson.actions) {
            action.contentErupt = this.eruptBuildModel.actionErupts
                ? this.eruptBuildModel.actionErupts[action.code]
                : null;
            if (action.rowMode === 'none') return;
            if (action.type)
                action.iif = (item) => {
                    if (action.ifExpr) {
                        let depend = this.actionLink.fromValue;
                        action.show = eval(action.ifExpr);
                    } else {
                        action.show = true;
                    }
                    return action.show;
                };
            if (action.contentType === 'none') {
                //按钮确认信息
                action.pop = this.i18n.fanyi('' + action.pop);
            } else {
                action.pop = false;
            }
            action.click = (record) => {
                this.createAction(action, record);
            };
            tableOperators.push(action);
        }
        //drill
        const eruptJson = this.eruptBuildModel.eruptModel.eruptJson;
        for (let i in eruptJson.drills) {
            let drill = eruptJson.drills[i];
            tableOperators.push({
                type: 'link',
                tooltip: drill.title,
                text: `<i class="${drill.icon}"></i>`,
                click: (record) => {
                    let drill = eruptJson.drills[i];
                    this.modal.create({
                        nzWrapClassName: 'modal-xxl',
                        nzStyle: { top: '30px' },
                        nzMaskClosable: false,
                        nzKeyboard: false,
                        nzTitle: drill.title,
                        nzFooter: null,
                        nzContent: TableComponent,
                        nzComponentParams: {
                            drill: {
                                code: drill.code,
                                val: record,
                                erupt: drill.link.linkErupt,
                                parent: this.eruptBuildModel,
                            },
                        },
                    });
                },
            });
        }
        if (tableOperators.length > 0) {
            _columns.push({
                title: this.i18n.fanyi('table.operation'),
                fixed: 'right',
                width: tableOperators.length * 40 + 8,
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
    getModalOperatorExecuteParams(action: Action, record: STData, contentComponentInstance: any) {
        const em = this.eruptBuildModel.eruptModel;
        const contentErupt = action.contentErupt.eruptModel;

        const param = {
            dependency: {
                eruptName: em.eruptName,
                ids: this.getSelectedTableRowIds(this, em.eruptJson.primaryKeyCol, record),
            },
            content: {
                eruptName: contentErupt.eruptName,
                ids: null,
                formValue: null,
            },
        };
        if (action.contentType === 'table') {
            param.content.ids = this.getSelectedTableRowIds(
                contentComponentInstance,
                contentErupt.eruptJson.primaryKeyCol,
                null
            );
        } else if (action.contentType === 'form') {
            const eruptValue = this.dataHandler.eruptValueToObject(action.contentErupt);
            param.content.formValue = eruptValue;
        }
        return param;
    }
    createModalActionButton(action: Action, button: ModalButton, record: STData): ModalButtonOptions {
        let item = record;
        button.danger = true;
        button.show = button.ifExpr ? eval(button.ifExpr) : true;
        const that = this;
        button.onClick = async function (this: ModalButtonOptions<any>, contentComponent: any) {
            that.selectedRows = [];
            const params = that.getModalOperatorExecuteParams(action, contentComponent, record);
            let res = await that.dataService
                .executeAction(that.eruptBuildModel.eruptModel.eruptName, action.code, button.code, params)
                .toPromise()
                .then();
            that.st.reload();
            if (res.data) {
                eval(res.data);
            }
        };
        return button;
    }

    getSelectedTableRowIds(table: TableComponent, rowIdName: string, record: STData): string[] {
        let ids = [];
        //先找选中的数据
        table.selectedRows.forEach((e) => {
            ids.push(e[rowIdName]);
        });
        //如果是在数据行的则选中的是当前行，否则为checkbox或者radio选中的行
        ids = record ? [record[rowIdName]] : ids;
        return ids;
    }
    createAction(action: Action, record: STData) {
        const eruptModel = this.eruptBuildModel.eruptModel;

        if (!action.contentErupt) action.contentErupt = this.eruptBuildModel;
        const size = action.contentType === 'table' || action.contentErupt.tabErupts ? 'modal-xxl' : 'modal-lg';
        const options: ModalOptions = {
            nzKeyboard: true,
            nzTitle: '' + action.text,
            nzStyle: { top: '60px' },
            nzWrapClassName: size,
            nzOkLoading: true,

            nzContent: this.getActionContent(action.contentType),
            nzComponentParams: this.getActionContentInitParams(action, record),
            nzMaskClosable: false,
        };
        //如果行为是行数据依赖的，那么提醒选择数据
        if (
            action.rowMode !== 'none' &&
            this.getSelectedTableRowIds(this, eruptModel.eruptJson.primaryKeyCol, record).length === 0
        ) {
            this.msg.warning(this.i18n.fanyi('table.require.select_one'));
            return;
        }
        let buttons = action.buttons;

        //如果按钮只有一个，那么ok按钮执行逻辑，否则自定义按钮
        if (buttons.length === 0) options.nzFooter = null;
        else if (buttons.length === 1) {
            options.nzOnOk = this.createModalActionButton(action, buttons[0], record).onClick;
            options.nzCancelText = this.i18n.fanyi('global.close');
        } else {
            options.nzFooter = null;
            const footer = [];
            buttons.forEach((button) => {
                footer.push(this.createModalActionButton(action, button, record));
            });
            options.nzFooter = footer;
        }
        if (action.contentType === 'none') {
            options.nzContent = this.i18n.fanyi('table.hint.operation');
            this.modal.confirm(options);
        } else {
            this.modal.create(options);
        }
    }
    getActionContentInitParams(action: Action, record: STData): Partial<any> {
        if (action.contentType === 'tpl')
            return {
                url: this.dataService.getEruptActionTpl(
                    this.eruptBuildModel.eruptModel.eruptName,
                    action.code,
                    this.getSelectedTableRowIds(this, this.eruptBuildModel.eruptModel.eruptJson.primaryKeyCol, null)
                ),
            };
        else if (action.contentType === 'importx') {
            const em = this.actionLink.fromErupt.eruptModel;
            let paramData = this.actionLink
                ? { fromErupt: em.eruptName, fromEruptId: this.actionLink.fromValue[em.eruptJson.primaryKeyCol] }
                : {};
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
                    });
                });
            const param = {
                actionLink: {
                    fromErupt: this.eruptBuildModel,
                    fromValue: record,
                    power: action.power,
                    erupt: action.contentErupt,
                    conditions: conditions,
                    behavior: action.formMode,
                },
            };
            return param;
        }
    }

    /**
     * 自定义功能触发
     * @param rowOperation 行按钮对象
     * @param data 数据（单个执行时使用）
     */
    createOperator(rowOperation: RowOperation, data?: object) {
        const eruptModel = this.eruptBuildModel.eruptModel;
        const ro = rowOperation;
        let ids = [];
        if (data) {
            ids = [data[eruptModel.eruptJson.primaryKeyCol]];
        } else {
            if (ro.mode === OperationMode.MULTI && this.selectedRows.length === 0) {
                this.msg.warning(this.i18n.fanyi('table.require.select_one'));
                return;
            }
            this.selectedRows.forEach((e) => {
                ids.push(e[eruptModel.eruptJson.primaryKeyCol]);
            });
        }
        if (ro.type === OperationType.TPL) {
            let url = this.dataService.getEruptOperationTpl(this.eruptBuildModel.eruptModel.eruptName, ro.code, ids);
            this.modal.create({
                nzKeyboard: true,
                nzTitle: ro.title,
                nzMaskClosable: false,
                nzStyle: { top: '20px' },
                // nzWrapClassName: "modal-xxl",
                nzWrapClassName: 'modal-lg',
                nzFooter: null,
                nzContent: EruptIframeComponent,
                nzComponentParams: {
                    url: url,
                },
            });
        } else if (ro.type == OperationType.IMPORT) {
            let paramData = this._drill
                ? { parent: this._drill.parent.eruptModel.eruptName, parentId: this._drill.val }
                : {};
            let model = this.modal.create({
                nzKeyboard: true,
                nzTitle: 'Excel导入',
                nzOkText: null,
                nzCancelText: '关闭（ESC）',
                nzWrapClassName: 'modal-lg',
                nzContent: ExcelImportComponent,
                nzComponentParams: {
                    eruptModel: this.eruptBuildModel.eruptModel,
                    url:
                        RestPath.data +
                        '/' +
                        this.eruptBuildModel.eruptModel.eruptName +
                        '/operator/importx/' +
                        ro.code,
                    param: paramData,
                },
                nzOnCancel: () => {
                    if (model.getContentComponent().upload) {
                        this.st.reload();
                    }
                },
            });
        } else if (ro.type === OperationType.ERUPT) {
            let operationErupt = null;
            if (this.eruptBuildModel.operationErupts) {
                operationErupt = this.eruptBuildModel.operationErupts[ro.code];
            }
            if (operationErupt) {
                if (ro.eruptMode === OperationEruptMode.FORM) {
                    this.dataHandler.initErupt({ eruptModel: operationErupt });
                    this.dataHandler.emptyEruptValue({
                        eruptModel: operationErupt,
                    });
                    let modal = this.modal.create({
                        nzKeyboard: false,
                        nzTitle: ro.title,
                        nzMaskClosable: false,
                        nzCancelText: this.i18n.fanyi('global.close'),
                        nzWrapClassName: 'modal-lg',
                        nzOnOk: async () => {
                            modal.updateConfig({ nzCancelDisabled: true });
                            let eruptValue = this.dataHandler.eruptValueToObject({ eruptModel: operationErupt });
                            let res = await this.dataService
                                .execOperatorFun(eruptModel.eruptName, ro.code, ids, eruptValue)
                                .toPromise()
                                .then((res) => res);
                            modal.updateConfig({ nzCancelDisabled: false });
                            this.selectedRows = [];
                            if (res.status === Status.SUCCESS) {
                                this.st.reload();
                                res.data && eval(res.data);
                                return true;
                            } else {
                                return false;
                            }
                        },
                        nzContent: EditTypeComponent,
                        nzComponentParams: {
                            mode: Scene.ADD,
                            eruptBuildModel: {
                                eruptModel: operationErupt,
                            },
                            parentEruptName: this.eruptBuildModel.eruptModel.eruptName,
                        },
                    });
                } else {
                    let modal = this.modal.create({
                        nzKeyboard: false,
                        nzTitle: ro.title,
                        nzMaskClosable: false,
                        nzCancelText: '关闭',
                        nzWrapClassName: 'modal-xxl',
                        nzOnOk: async () => {
                            modal.updateConfig({ nzCancelDisabled: true });
                            const sids = [];

                            const sRows = modal.getContentComponent().selectedRows;
                            if (!sRows || sRows.length === 0) {
                                this.msg.warning('请至少选一条数据');
                                return;
                            }

                            sRows.forEach((e) => {
                                sids.push(
                                    e[modal.getContentComponent().eruptBuildModel.eruptModel.eruptJson.primaryKeyCol]
                                );
                            });
                            //let eruptValue = this.dataHandler.eruptValueToObject({eruptModel: operationErupt});
                            let res = await this.dataService
                                .execOperatorFun(eruptModel.eruptName, ro.code, sids, this._drill)
                                .toPromise()
                                .then((res) => res);
                            modal.updateConfig({ nzCancelDisabled: false });
                            this.selectedRows = [];
                            if (res.status === Status.SUCCESS) {
                                this.st.reload();
                                res.data && eval(res.data);
                                return true;
                            } else {
                                return false;
                            }
                        },
                        nzContent: TableComponent,
                        nzComponentParams: {
                            eruptName: operationErupt.eruptName,
                        },
                    });
                }
            } else {
                this.modal.confirm({
                    nzTitle: ro.title,
                    nzContent: this.i18n.fanyi('table.hint.operation'),
                    nzCancelText: this.i18n.fanyi('global.close'),
                    nzOnOk: async () => {
                        this.selectedRows = [];
                        let res = await this.dataService
                            .execOperatorFun(this.eruptBuildModel.eruptModel.eruptName, ro.code, ids, this._drill)
                            .toPromise()
                            .then();
                        this.st.reload();
                        if (res.data) {
                            eval(res.data);
                        }
                    },
                });
            }
        }
    }

    //新增
    addRow() {
        const modal = this.modal.create({
            nzStyle: { top: '60px' },
            nzWrapClassName: 'modal-lg',
            nzMaskClosable: false,
            nzKeyboard: false,
            nzTitle: this.i18n.fanyi('global.new'),
            nzContent: EditComponent,
            nzComponentParams: {
                eruptBuildModel: this.eruptBuildModel,
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
                        if (this._drill && this._drill.val) {
                            res = await this.dataService
                                .addEruptDrillData(
                                    this._drill.parent.eruptModel.eruptName,
                                    this._drill.code,
                                    this._drill.val[this._drill.parent.eruptModel.eruptJson.primaryKeyCol],
                                    this.dataHandler.eruptValueToObject(this.eruptBuildModel)
                                )
                                .toPromise()
                                .then((res) => res);
                        } else {
                            let header = {};
                            if (this.linkTree) {
                                let lt = this.eruptBuildModel.eruptModel.eruptJson.linkTree;
                                if (lt.dependNode && lt.value) {
                                    header['link'] = this.eruptBuildModel.eruptModel.eruptJson.linkTree.value;
                                }
                            }
                            res = await this.dataService
                                .addEruptData(
                                    this.eruptBuildModel.eruptModel.eruptName,
                                    this.dataHandler.eruptValueToObject(this.eruptBuildModel),
                                    header
                                )
                                .toPromise()
                                .then((res) => res);
                        }
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
        let depend = this._drill ? this._drill : null;
        if (event.type === 'loaded') {
            for (let i in this.eruptBuildModel.eruptModel.eruptJson.rowOperation) {
                let ro = this.eruptBuildModel.eruptModel.eruptJson.rowOperation[i];

                if (ro.mode === OperationMode.BUTTON) {
                    ro.show = ro.ifExpr ? eval(ro.ifExpr) : true;
                } else {
                    ro.show = false;
                }
            }
            if (power.ifExpr && depend) {
                power.add = eval(power.ifExpr);
                power.edit = eval(power.ifExpr);
                power.delete = eval(power.ifExpr);
                power.importable = eval(power.ifExpr);
                power.delete = eval(power.ifExpr);
            }
        }
        let rows: STData[];
        if (this._reference) {
            if (this._reference.mode == SelectMode.radio) {
                if (event.type === 'click') {
                    for (let datum of this.st._data) {
                        datum.checked = false;
                    }
                    event.click.item.checked = true;
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = event.click.item;
                } else if (event.type === 'radio') {
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = event.radio;
                }
            } else if (this._reference.mode == SelectMode.checkbox) {
                if (event.type === 'checkbox') {
                    this._reference.eruptField.eruptFieldJson.edit.$tempValue = event.checkbox;
                }
            }
            rows = this._reference.eruptField.eruptFieldJson.edit.$tempValue;
        } else {
            if (event.type === 'checkbox') {
                this.selectedRows = event.checkbox;
            }
            rows = event.checkbox;
        }

        if (rows) {
            let deletable = true;
            for (let item of rows) {
                if (power.ifExpr) {
                    let depend = this._drill ? this._drill : null;
                    deletable = eval(power.ifExpr);
                    if (!deletable) break;
                }
            }
            power.delete = deletable;
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
        // this._drill.val
        //导出接口
        this.downloading = true;
        this.dataService.downloadExcel(this.eruptBuildModel.eruptModel.eruptName, condition, () => {
            this.downloading = false;
        });
    }

    clickTreeNode(event) {
        this.showTable = true;
        this.eruptBuildModel.eruptModel.eruptJson.linkTree.value = event;
        this.searchErupt.eruptJson.linkTree.value = event;
        this.query();
    }

    // excel导入
    importableExcel() {
        let model = this.modal.create({
            nzKeyboard: true,
            nzTitle: 'Excel ' + this.i18n.fanyi('table.import'),
            nzOkText: null,
            nzCancelText: this.i18n.fanyi('global.close') + '（ESC）',
            nzWrapClassName: 'modal-lg',
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
