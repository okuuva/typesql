import type { SimpleExprFunctionContext, ExprContext, InsertStatementContext, DeleteStatementContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnSchema, ColumnDef, TypeVar, Type, Constraint, SubstitutionHash, TypeAndNullInfer } from './types';
import type { InferType } from '../mysql-mapping';
import { TerminalNode } from '@wsporto/typesql-parser';
export declare function freshVar(name: string, typeVar: InferType, table?: string, list?: true): TypeVar;
export declare function createColumnType(col: ColumnDef): TypeVar;
export declare function createColumnTypeFomColumnSchema(col: ColumnSchema): TypeVar;
export type ExprOrDefault = ExprContext | TerminalNode;
export declare function getInsertIntoTable(insertStatement: InsertStatementContext): string;
export declare function getInsertColumns(insertStatement: InsertStatementContext, fromColumns: ColumnDef[]): ColumnDef[];
export declare function getDeleteColumns(deleteStatement: DeleteStatementContext, dbSchema: ColumnSchema[]): ColumnDef[];
export declare function generateTypeInfo(namedNodes: TypeAndNullInfer[], constraints: Constraint[]): InferType[];
export declare function getVarType(substitutions: SubstitutionHash, typeVar: Type): InferType;
export declare function verifyDateTypesCoercion(type: Type): Type;
export declare function isTimeLiteral(literal: string): boolean;
export declare function isDateTimeLiteral(literal: string): boolean;
export declare function isDateLiteral(literal: string): boolean;
export declare function getFunctionName(simpleExprFunction: SimpleExprFunctionContext): string;
export type VariableLengthParams = {
    kind: 'VariableLengthParams';
    paramType: InferType;
};
export type FixedLengthParams = {
    kind: 'FixedLengthParams';
    paramsType: TypeVar[];
};
export type FunctionParams = VariableLengthParams | FixedLengthParams;
//# sourceMappingURL=collect-constraints.d.ts.map