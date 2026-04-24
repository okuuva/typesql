import { Sql } from 'postgres';
import { PostgresColumnSchema, PostgresDescribe } from './types';
import { DatabaseClient, TypeSqlError } from '../types';
import { Result, ResultAsync } from 'neverthrow';
import { ForeignKeyInfo } from '../sqlite-query-analyzer/query-executor';
import { UserFunctionSchema } from '../postgres-query-analyzer/types';
import { PostgresEnumType } from '../sqlite-query-analyzer/types';
export declare function loadDbSchema(sql: Sql, schemas?: string[] | null): ResultAsync<PostgresColumnSchema[], TypeSqlError>;
export type EnumMap = Map<number, EnumResult[]>;
export declare function loadEnumsMap(sql: Sql): ResultAsync<EnumMap, TypeSqlError>;
export type EnumResult = {
    type_oid: number;
    enum_name: string;
    enumlabel: string;
};
export declare function loadEnums(sql: Sql): ResultAsync<EnumResult[], TypeSqlError>;
export type CheckConstraintResult = Record<string, PostgresEnumType>;
export declare function loadCheckConstraints(sql: Sql): ResultAsync<CheckConstraintResult, TypeSqlError>;
export type CheckConstraintType = {
    schema_name: string;
    table_name: string;
    column_name: string;
    constraint_name: string;
    constraint_definition: string;
};
export declare const postgresDescribe: (sql: Sql, sqlQuery: string) => ResultAsync<PostgresDescribe, TypeSqlError>;
export declare function createPostgresClient(databaseUri: string): Result<DatabaseClient, TypeSqlError>;
export declare function loadForeignKeys(sql: Sql): ResultAsync<ForeignKeyInfo[], TypeSqlError>;
export declare function loadUserFunctions(sql: Sql, schemas?: string[] | null): ResultAsync<UserFunctionSchema[], TypeSqlError>;
//# sourceMappingURL=postgres.d.ts.map