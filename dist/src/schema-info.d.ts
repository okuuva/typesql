import { CheckConstraintResult, EnumMap } from './drivers/postgres';
import { ColumnSchema, Table } from './mysql-query-analyzer/types';
import { ForeignKeyInfo } from './sqlite-query-analyzer/query-executor';
import { DatabaseClient, MySqlClient, SQLiteClient, TypeSqlDialect, TypeSqlError } from './types';
import { ResultAsync } from 'neverthrow';
import { Either } from 'fp-ts/lib/Either';
import { UserFunctionSchema } from './postgres-query-analyzer/types';
import { PostgresColumnSchema } from './drivers/types';
export type SchemaInfo = {
    kind: SQLiteClient | MySqlClient;
    columns: ColumnSchema[];
};
export type PostgresSchemaInfo = {
    kind: 'pg';
    columns: PostgresColumnSchema[];
    foreignKeys: ForeignKeyInfo[];
    userFunctions: UserFunctionSchema[];
    enumTypes: EnumMap;
    checkConstraints: CheckConstraintResult;
};
export declare function createClient(databaseUri: string, dialect: TypeSqlDialect, attach?: string[], loadExtensions?: string[], authToken?: string): ResultAsync<DatabaseClient, TypeSqlError>;
export declare function loadSchemaInfo(databaseClient: DatabaseClient, schemas?: string[]): ResultAsync<SchemaInfo | PostgresSchemaInfo, TypeSqlError>;
export declare function loadTableSchema(databaseClient: DatabaseClient, tableName: string): ResultAsync<ColumnSchema[], TypeSqlError>;
export declare function closeClient(db: DatabaseClient): Promise<void>;
export declare function selectTables(databaseClient: DatabaseClient): Promise<Either<TypeSqlError, Table[]>>;
//# sourceMappingURL=schema-info.d.ts.map