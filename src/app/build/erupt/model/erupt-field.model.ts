import { STColumn, STColumnTitle, STColumnButton } from '@delon/abc';
import * as internal from 'assert';
import { ModalButtonOptions, NzModalRef } from 'ng-zorro-antd';
import { EruptBuildModel } from './erupt-build.model';
import {
    AttachmentEnum,
    ChoiceEnum,
    DateEnum,
    EditType,
    HtmlEditTypeEnum,
    PickerMode,
    SelectMode,
    TabEnum,
    ViewType,
} from './erupt.enum';
import { Power } from './erupt.model';
import { Relation, QueryCondition } from './erupt.vo';

export interface EruptFieldModel {
    fieldName: string;
    eruptFieldJson: EruptField;
    choiceList?: VL[];
    choiceMap?: Map<String, VL>;
    tagList?: string[];
    value?: any;
}

//field detail
export interface EruptField {
    columns?: Column[];
    edit?: Edit;
}

export interface Column extends STColumn {
    title: STColumnTitle;
    index: string;
    show?: boolean;
    template?: string;
    link?: LinkModel;
    edit: Edit;
    eruptFieldModel?: EruptFieldModel;
}

export interface Action extends STColumnButton {
    code?: string;
    ifExpr?: string;
    power: Power;
    relations: Relation[];
    contentType?: 'table' | 'form' | 'importx' | 'tpl' | 'none';
    contentErupt?: EruptBuildModel;
    selectMode?: 'checkbox' | 'radio';
    formMode?: 'edit' | 'add';
    buttons?: ModalButton[];
    tpl?: any;
    rowMode?: 'SINGLE' | 'MULTI' | 'NONE';
}

export interface ModalButton extends ModalButtonOptions {
    code?: string;
    modalRef?: NzModalRef;
    action?: Action;
}

export interface LinkModel {
    language: any;
    icon?: string;
    className?: 'text-center';
    viewType?: ViewType;
}
export interface Edit {
    title: string;
    notNull: boolean;
    desc: string;
    type: EditType;
    show: boolean;
    showBy: { dependField: string; expr: string };
    readOnly: Readonly;
    placeHolder: string;
    search: Search;
    tabType: TabType;
    inputType: InputType;
    numberType: NumberType;
    referenceTreeType: ReferenceTreeType;
    referenceTableType: ReferenceTableType;
    attachmentType: AttachmentType;
    autoCompleteType: AutoCompleteType;
    htmlEditorType: HtmlEditorType;
    boolType: BoolType;
    choiceType: ChoiceType;
    tagsType: TagsType;
    dateType: DateType;
    sliderType: SliderType;
    codeEditType: CodeEditType;
    mapType: MapType;
    $tabTreeViewData?: any;
    $value?: any;
    $viewValue?: any;
    $tempValue?: any;
    $beforeValue?: any;
    $l_val?: any;
    $r_val?: any;
}

interface Readonly {
    add: boolean;
    edit: boolean;
}

interface HtmlEditorType {
    value: HtmlEditTypeEnum;
}

interface Search {
    value: boolean;
    vague: boolean;
    notNull: boolean;
}

interface CodeEditType {
    language: string;
}

//Edit Type
interface InputType {
    length: number;
    type: string;
    fullSpan: boolean;
    prefix: VL[];
    suffix: VL[];
    prefixValue?: string;
    suffixValue?: string;
}

interface NumberType {
    min: number;
    max: number;
}

interface AutoCompleteType {
    items: any[];
    triggerLength: number;
}

export interface ReferenceTreeType {
    id: string;
    label: string;
    pid: string;
    dependField: string;
    expandLevel: number;
}

export interface ReferenceTableType {
    id: string;
    label: string;
    dependField: string;
}

interface BoolType {
    trueText: string;
    falseText: string;
}

interface ChoiceType {
    type: ChoiceEnum;
    vl: VL[];
    anewFetch: boolean;
}

interface TagsType {
    allowExtension: boolean;
    joinSeparator: string;
}

export interface TabType {
    type: TabEnum;
}

interface SliderType {
    min: number;
    max: number;
    step: number;
    markPoints: number[];
    dots: boolean;
    marks?: any;
}

interface DateType {
    type: DateEnum;
    pickerMode: PickerMode;
    isRange: boolean;
}

interface AttachmentType {
    size: number;
    fileTypes: string[];
    path: String;
    maxLimit: number;
    type: AttachmentEnum;
    fileSeparator: string;
    baseUrl: { value: string };
}

export interface MapType {
    draw: boolean;
    drawMaxLayer: number;
}

export interface VL {
    value: string;
    label: string;
    desc: string;
    disable: boolean;
    $viewValue?: any;
}
