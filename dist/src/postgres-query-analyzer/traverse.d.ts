import { StmtContext } from '@wsporto/typesql-parser/postgres/PostgreSQLParser';
import { PostgresColumnSchema } from '../drivers/types';
import { DynamicSqlInfo2 } from '../mysql-query-analyzer/types';
import { QueryType } from '../types';
import { Relation2 } from '../sqlite-query-analyzer/sqlite-describe-nested-query';
import { CheckConstraintResult } from '../drivers/postgres';
import { JsonType, PostgresEnumType, PostgresSimpleType } from '../sqlite-query-analyzer/types';
import { UserFunctionSchema } from './types';
export type NotNullInfo = {
    schema: string;
    table: string;
    column_name: string;
    is_nullable: boolean;
    original_is_nullable?: boolean;
    column_default?: true;
    column_key?: 'PRI' | 'UNI' | '';
    type: PostgresSimpleType;
    jsonType?: JsonType;
    recordTypes?: NotNullInfo[];
};
export type PostgresTraverseResult = {
    queryType: QueryType;
    multipleRowsResult: boolean;
    columns: NotNullInfo[];
    parametersNullability: ParamInfo[];
    whereParamtersNullability?: ParamInfo[];
    parameterList: boolean[];
    limit?: number;
    orderByColumns?: string[];
    returning?: boolean;
    relations?: Relation2[];
    dynamicQueryInfo?: DynamicSqlInfo2;
};
export type ParamInfo = {
    isNotNull: boolean;
    checkConstraint?: PostgresEnumType;
};
export type Relation3 = {
    name: string;
    alias: string;
    parentRelation: string;
    joinColumn: string;
};
export type TraverseOptions = {
    collectNestedInfo?: boolean;
    collectDynamicQueryInfo?: boolean;
};
export declare function defaultOptions(): TraverseOptions;
export declare function traverseSmt(stmt: StmtContext, dbSchema: PostgresColumnSchema[], checkConstraints: CheckConstraintResult, userFunctions: UserFunctionSchema[], options: TraverseOptions): PostgresTraverseResult;
export type TableReturnType = {
    kind: 'table';
    columns: {
        name: string;
        type: string;
    }[];
};
export type SetofReturnType = {
    kind: 'setof';
    table: string;
};
export type TableNameReturnType = {
    kind: 'table_name';
    table: string;
};
export type FunctionReturnType = TableReturnType | SetofReturnType | TableNameReturnType;
export declare function parseReturnType(returnType: string): FunctionReturnType;
//# sourceMappingURL=traverse.d.ts.map