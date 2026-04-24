import { type Connection, type Pool } from 'mysql2/promise';
import { type Either } from 'fp-ts/lib/Either';
import type { MySqlDialect, TypeSqlError } from './types';
import type { ColumnSchema, Table } from './mysql-query-analyzer/types';
import { ResultAsync } from 'neverthrow';
export declare function createMysqlClientForTest(databaseUri: string): Promise<MySqlDialect>;
export declare function createMysqlClient(databaseUri: string): ResultAsync<MySqlDialect, TypeSqlError>;
export declare function loadMysqlSchema(conn: Connection, schema: string): ResultAsync<ColumnSchema[], TypeSqlError>;
export declare function loadMySqlTableSchema(conn: Connection, schema: string, tableName: string): ResultAsync<ColumnSchema[], TypeSqlError>;
export declare function selectTablesFromSchema(conn: Connection): Promise<Either<TypeSqlError, Table[]>>;
export declare function explainSql(pool: Pool, sql: string): Promise<Either<TypeSqlError, boolean>>;
//# sourceMappingURL=queryExectutor.d.ts.map