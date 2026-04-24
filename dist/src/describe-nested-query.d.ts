import { type QueryContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnInfo, ColumnSchema } from './mysql-query-analyzer/types';
export type NestedResultInfo = {
    relations: RelationInfo[];
};
export type RelationInfo = {
    name: string;
    groupKeyIndex: number;
    columns: ModelColumn[];
};
export type Cardinality = 'one' | 'many' | '';
export type ModelColumn = Field | RelationField;
export type Field = {
    type: 'field';
    name: string;
    index: number;
};
export type RelationField = {
    type: 'relation';
    name: string;
    cardinality: Cardinality;
    notNull: boolean;
};
export type TableName = {
    name: string;
    alias: string | '';
    asSymbol: boolean;
    isJunctionTable: boolean;
};
export declare function describeNestedQuery(sql: string, dbSchema: ColumnSchema[]): NestedResultInfo;
export declare function generateNestedInfo(queryContext: QueryContext, dbSchema: ColumnSchema[], columns: ColumnInfo[]): NestedResultInfo;
//# sourceMappingURL=describe-nested-query.d.ts.map