import { Edit, EruptFieldModel, XSTColumn, Action } from './erupt-field.model';
import { OperationEruptMode, OperationMode, OperationType } from './erupt.enum';

export interface EruptModel {
    eruptFieldModels: EruptFieldModel[];
    eruptJson: Erupt;
    eruptName: string;
    //# customer prop
    eruptFieldModelMap?: Map<String, EruptFieldModel>;
    tableColumns?: XSTColumn[];
    mode?: 'edit' | 'search';
}

export interface Erupt {
    actions: Action[];
    primaryKeyCol: string;
    power: Power;
    tree: Tree;
    linkTree: LinkTree;
    rowOperation: RowOperation[];
    drills: Drill[];
}

interface LinkTree {
    field: string;
    dependNode: boolean;
    value: any;
}

export interface Drill {
    code: string;
    title: string;
    icon: string;
    column: string;
    link: Link;
    power: Power;
}

export interface Tree {
    id: string;
    label: string;
    pid: string;
    expandLevel: number;
    level: number;
    linkTable: Link[];
    children?: Tree[];
    data?: any;
}

export interface Checkbox {
    id: any;
    label: any;
    checked: boolean;
}

export interface Link {
    linkErupt: string;
}

export interface RowOperation {
    eruptMode: OperationEruptMode;
    code: string;
    icon: string;
    title: string;
    mode: OperationMode;
    type: OperationType;
    tip: string;
    ifExpr: string;
    show?: boolean;
}

interface CodeAndEdit {
    edit: Edit;
    codeType: string;
    code: string;
}

export interface Power {
    add: boolean;
    delete: boolean;
    edit: boolean;
    query: boolean;
    viewDetails: boolean;
    importable: boolean;
    export: boolean;
    ifExpr: string;
}

export interface Row {
    color: string;
    columns: Column[];
}

export interface Column {
    style: string;
    value: string;
    colspan: number;
}
