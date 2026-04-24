import { CrudQueryType, PgDielect, TypeSqlError } from '../types';
import { ResultAsync } from 'neverthrow';
import { PostgresSchemaInfo } from '../schema-info';
import { PostgresColumnSchema } from '../drivers/types';
export declare function generateCode(client: PgDielect, sql: string, queryName: string, schemaInfo: PostgresSchemaInfo): ResultAsync<string, TypeSqlError>;
export declare function generateCrud(queryType: CrudQueryType, tableName: string, dbSchema: PostgresColumnSchema[]): string;
//# sourceMappingURL=pg.d.ts.map