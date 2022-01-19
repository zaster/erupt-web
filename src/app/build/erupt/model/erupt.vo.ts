export interface QueryCondition {
    key: string;
    value: any;
    expression: Expression;
}

export interface Relation extends QueryCondition {
    recordKey: string;
}

export enum Expression {
    EQ = 'EQ',
    RANGE = 'RANGE',
    IN = 'IN',
}
