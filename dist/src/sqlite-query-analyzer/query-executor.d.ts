import { type Either } from 'fp-ts/lib/Either';
import type { DatabaseClient, TypeSqlError } from '../types';
import type { ColumnSchema, Table } from '../mysql-query-analyzer/types';
import { type Database as DatabaseType } from 'better-sqlite3';
import type { Database as LibSqlDatabase } from 'libsql';
import { Result } from 'neverthrow';
export declare function createSqliteClient(client: 'better-sqlite3' | 'bun:sqlite' | 'd1', databaseUri: string, attachList: string[], loadExtensions: string[]): Result<DatabaseClient, TypeSqlError>;
export declare function loadDbSchema(db: DatabaseType | LibSqlDatabase): Result<ColumnSchema[], TypeSqlError>;
type TableInfo = {
    name: string;
    type: string;
    notnull: number;
    dflt_value: string;
    pk: number;
    hidden: number;
};
type TableAndType = {
    name: string;
    type: 'T' | 'VT';
};
export declare function getTableInfo(db: DatabaseType | LibSqlDatabase, schema: string, table: string): TableInfo[];
export declare function getIndexInfo(db: DatabaseType | LibSqlDatabase, schema: string, table: string): Map<string, true>;
export declare function getTables(db: DatabaseType | LibSqlDatabase, schema: string): TableAndType[];
export declare function selectSqliteTablesFromSchema(db: DatabaseType | LibSqlDatabase): Either<TypeSqlError, Table[]>;
export declare function explainSql(db: DatabaseType | LibSqlDatabase, sql: string): Either<TypeSqlError, boolean>;
export type ForeignKeyInfo = {
    fromTable: string;
    toTable: string;
    fromColumn: string;
    toColumn: string;
};
export declare function loadForeignKeys(db: DatabaseType | LibSqlDatabase): Result<ForeignKeyInfo[], TypeSqlError>;
export declare function loadCreateTableStmt(db: DatabaseType | LibSqlDatabase, tableName: string): Either<TypeSqlError, string>;
export declare function loadCreateTableStmtWithCheckConstraint(db: DatabaseType | LibSqlDatabase): Result<string | null, TypeSqlError>;
export {};
//# sourceMappingURL=query-executor.d.ts.map