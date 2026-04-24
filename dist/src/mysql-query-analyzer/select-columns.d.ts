import { ParserRuleContext } from '@wsporto/typesql-parser';
import type { ParseTree } from '@wsporto/typesql-parser';
import { type JoinedTableContext, type SelectItemContext, type ExprContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnDef, ColumnSchema, FieldName } from './types';
export declare function includeColumn(column: ColumnDef, table: string): boolean;
export declare function filterColumns(dbSchema: ColumnSchema[], withSchema: ColumnDef[], tableAlias: string | undefined, table: FieldName): ColumnDef[];
export declare function selectAllColumns(tablePrefix: string, fromColumns: ColumnDef[]): ColumnDef[];
export declare function getColumnName(selectItem: SelectItemContext): string;
export declare function extractFieldsFromUsingClause(joinedTableContext: JoinedTableContext): string[];
export declare function splitName(fieldName: string): FieldName;
export declare function splitTableName(fieldName: string): FieldName;
export declare const functionAlias: ColumnSchema[];
export declare function findColumnSchema(tableName: string, columnName: string, dbSchema: ColumnSchema[]): ColumnSchema | undefined;
export declare function findColumn(fieldName: FieldName, columns: ColumnDef[]): ColumnDef;
export declare function findColumnOrNull(fieldName: FieldName, columns: ColumnDef[]): ColumnDef | undefined;
export declare function extractOriginalSql(rule: ParserRuleContext): string;
type Expr = {
    expr: ParseTree;
    isSubQuery: boolean;
};
export declare function getExpressions(ctx: ParserRuleContext, exprType: any): Expr[];
export type ExpressionAndOperator = {
    operator: string;
    expr: ExprContext;
};
export declare function getTopLevelAndExpr(expr: ExprContext, all: ExpressionAndOperator[]): void;
export declare function getSimpleExpressions(ctx: ParserRuleContext): ParseTree[];
export {};
//# sourceMappingURL=select-columns.d.ts.map