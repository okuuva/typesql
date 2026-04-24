import type { ColumnSchema } from './mysql-query-analyzer/types';
import type { TypeSqlDialect } from './types';
export declare function generateSelectStatement(dialect: TypeSqlDialect, tableName: string, columns: ColumnSchema[]): string;
export declare function generateInsertStatement(dialect: TypeSqlDialect, tableName: string, dbSchema: ColumnSchema[]): string;
export declare function generateUpdateStatement(dialect: TypeSqlDialect, tableName: string, dbSchema: ColumnSchema[]): string;
export declare function generateDeleteStatement(dialect: TypeSqlDialect, tableName: string, dbSchema: ColumnSchema[]): string;
//# sourceMappingURL=sql-generator.d.ts.map