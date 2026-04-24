import { type Either } from 'fp-ts/lib/Either';
import type { ColumnInfo, ColumnSchema } from '../mysql-query-analyzer/types';
import type { BunDialect, CrudQueryType, D1Dialect, LibSqlClient, SQLiteClient, SQLiteDialect, TypeSqlError } from '../types';
import type { Field2 } from '../sqlite-query-analyzer/sqlite-describe-nested-query';
import { type TsField2 } from '../ts-nested-descriptor';
export declare function validateAndGenerateCode(client: SQLiteDialect | LibSqlClient | BunDialect | D1Dialect, sql: string, queryName: string, sqliteDbSchema: ColumnSchema[], isCrud?: boolean): Either<TypeSqlError, string>;
export declare function generateCrud(client: SQLiteClient, queryType: CrudQueryType, tableName: string, dbSchema: ColumnSchema[]): string;
export declare function getQueryName(queryType: CrudQueryType, tableName: string): string;
export declare function generateTsCode(sql: string, queryName: string, sqliteDbSchema: ColumnSchema[], client: SQLiteClient, isCrud?: boolean): Either<TypeSqlError, string>;
export declare function mapFieldToTsField(columns: ColumnInfo[], field: Field2, client: SQLiteClient): TsField2;
//# sourceMappingURL=sqlite.d.ts.map