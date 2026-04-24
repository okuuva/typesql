import { type Select_stmtContext, type Sql_stmtContext, ExprContext } from '@wsporto/typesql-parser/sqlite';
import type { ColumnDef, ColumnSchema, TraverseContext } from '../mysql-query-analyzer/types';
import { type TraverseResult2 } from '../mysql-query-analyzer/traverse';
import { type Either } from 'fp-ts/lib/Either';
import type { TypeSqlError } from '../types';
export declare function tryTraverse_Sql_stmtContext(sql_stmt: Sql_stmtContext, traverseContext: TraverseContext): Either<TypeSqlError, TraverseResult2>;
export type ColumnName = {
    name: string;
    table: string;
};
export declare function isNotNull(columnName: ColumnName, where: ExprContext | null): boolean;
export declare function isMultipleRowResult(select_stmt: Select_stmtContext, dbSchema: ColumnSchema[], fromColumns: ColumnDef[]): boolean;
//# sourceMappingURL=traverse.d.ts.map