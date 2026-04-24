import type { SchemaDef, TypeSqlError, PreprocessedSql, MySqlDialect } from './types';
import { type Either } from 'fp-ts/lib/Either';
import type { ColumnSchema } from './mysql-query-analyzer/types';
import type { InferType, DbType } from './mysql-mapping';
export declare function describeSql(dbSchema: ColumnSchema[], sql: string): SchemaDef;
export declare function verifyNotInferred(type: InferType): DbType | 'any';
export declare function parseSql(client: MySqlDialect, sql: string): Promise<Either<TypeSqlError, SchemaDef>>;
export declare function preprocessSql(sql: string, dialect: 'postgres' | 'mysql' | 'sqlite'): PreprocessedSql;
export declare function hasAnnotation(sql: string, annotation: string): boolean;
//# sourceMappingURL=describe-query.d.ts.map