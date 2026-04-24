import { ParseTree } from '@wsporto/typesql-parser';
import { type QueryContext, QuerySpecificationContext, type SelectStatementContext, type SubqueryContext, type QueryExpressionBodyContext, type InsertQueryExpressionContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnSchema, TypeInferenceResult, QueryInfoResult, InsertInfoResult, UpdateInfoResult, DeleteInfoResult, ParameterInfo, ColumnDef } from './types';
export declare function parse(sql: string): QueryContext;
export declare function parseAndInfer(sql: string, dbSchema: ColumnSchema[]): TypeInferenceResult;
export declare function parseAndInferParamNullability(sql: string): boolean[];
export declare function extractOrderByParameters(selectStatement: SelectStatementContext): string[];
export declare function extractLimitParameters(selectStatement: SelectStatementContext): ParameterInfo[];
export declare function isMultipleRowResult(selectStatement: SelectStatementContext, fromColumns: ColumnDef[]): boolean;
export declare function isSumExpressContext(selectItem: ParseTree): boolean;
export declare function getLimitOptions(selectStatement: SelectStatementContext): import("@wsporto/typesql-parser/mysql/MySQLParser").LimitOptionContext[];
export declare function extractQueryInfo(sql: string, dbSchema: ColumnSchema[]): QueryInfoResult | InsertInfoResult | UpdateInfoResult | DeleteInfoResult;
export declare function getAllQuerySpecificationsFromSelectStatement(selectStatement: SelectStatementContext | QueryExpressionBodyContext | InsertQueryExpressionContext | SubqueryContext): QuerySpecificationContext[];
//# sourceMappingURL=parse.d.ts.map