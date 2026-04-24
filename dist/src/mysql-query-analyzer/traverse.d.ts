import { type DeleteStatementContext, ExprContext, type InsertStatementContext, type QueryContext, type QuerySpecificationContext, type SelectStatementContext, type UpdateStatementContext, type WithClauseContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnDef, ColumnSchema, Constraint, DynamicSqlInfo, DynamicSqlInfo2, FieldName, ParameterInfo, TraverseContext, TypeAndNullInfer, TypeAndNullInferParam } from './types';
import type { ParameterDef } from '../types';
import type { Relation2 } from '../sqlite-query-analyzer/sqlite-describe-nested-query';
export type TraverseResult = SelectStatementResult | InsertStatementResult | UpdateStatementResult | DeleteStatementResult;
export type SelectStatementResult = {
    type: 'Select';
    constraints: Constraint[];
    columns: TypeAndNullInfer[];
    parameters: TypeAndNullInfer[];
    limitParameters: ParameterInfo[];
    isMultiRow: boolean;
    orderByColumns?: string[];
    dynamicSqlInfo: DynamicSqlInfo;
};
export type InsertStatementResult = {
    type: 'Insert';
    constraints: Constraint[];
    parameters: ParameterDef[];
};
export type UpdateStatementResult = {
    type: 'Update';
    constraints: Constraint[];
    data: TypeAndNullInfer[];
    parameters: TypeAndNullInfer[];
};
export type DeleteStatementResult = {
    type: 'Delete';
    constraints: Constraint[];
    parameters: ParameterDef[];
};
export declare function traverseQueryContext(queryContext: QueryContext, dbSchema: ColumnSchema[], namedParameters: string[]): SelectStatementResult | InsertStatementResult | UpdateStatementResult | DeleteStatementResult;
export declare function traverseInsertStatement(insertStatement: InsertStatementContext, traverseContext: TraverseContext): InsertStatementResult;
export declare function traverseDeleteStatement(deleteStatement: DeleteStatementContext, traverseContext: TraverseContext): DeleteStatementResult;
export declare function getUpdateColumns(updateStatement: UpdateStatementContext, traverseContext: TraverseContext): ColumnDef[];
export type QuerySpecificationResult = {
    columns: TypeAndNullInfer[];
    fromColumns: ColumnDef[];
};
export type TraverseResult2 = SelectResult | InsertResult | UpdateResult | DeleteResult;
export type SelectResult = {
    queryType: 'Select';
    constraints: Constraint[];
    parameters: TypeAndNullInferParam[];
    columns: TypeAndNullInfer[];
    multipleRowsResult: boolean;
    orderByColumns?: string[];
    relations: Relation2[];
    dynamicQueryInfo: DynamicSqlInfo2;
};
export type InsertResult = {
    queryType: 'Insert';
    constraints: Constraint[];
    parameters: TypeAndNullInferParam[];
    columns: TypeAndNullInfer[];
    returing: boolean;
};
export type UpdateResult = {
    queryType: 'Update';
    parameters: TypeAndNullInferParam[];
    constraints: Constraint[];
    columns: TypeAndNullInfer[];
    whereParams: TypeAndNullInferParam[];
    returningColumns: TypeAndNullInfer[];
    returing: boolean;
};
export type DeleteResult = {
    constraints: Constraint[];
    queryType: 'Delete';
    parameters: TypeAndNullInferParam[];
    returningColumns: TypeAndNullInfer[];
    returing: boolean;
};
export declare function traverseQuerySpecification(querySpec: QuerySpecificationContext, traverseContext: TraverseContext): QuerySpecificationResult;
export declare function traverseWithClause(withClause: WithClauseContext, traverseContext: TraverseContext): void;
export declare function filterColumns(dbSchema: ColumnSchema[], withSchema: ColumnDef[], tableAlias: string | undefined, table: FieldName): ColumnDef[];
export declare function selectAllColumns(tablePrefix: string, fromColumns: ColumnDef[]): ColumnDef[];
export declare function isMultipleRowResult(selectStatement: SelectStatementContext, fromColumns: ColumnDef[]): boolean;
export declare function verifyMultipleResult2(exprContext: ExprContext, fromColumns: ColumnDef[]): boolean;
export declare function getOrderByColumns(fromColumns: ColumnDef[], selectColumns: TypeAndNullInfer[]): string[];
//# sourceMappingURL=traverse.d.ts.map