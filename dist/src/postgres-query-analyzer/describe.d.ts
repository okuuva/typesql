import { TypeSqlError } from '../types';
import { Sql } from 'postgres';
import { ResultAsync } from 'neverthrow';
import { PostgresSchemaDef } from './types';
import { PostgresSchemaInfo } from '../schema-info';
export declare function describeQuery(postgres: Sql, sql: string, schemaInfo: PostgresSchemaInfo): ResultAsync<PostgresSchemaDef, TypeSqlError>;
//# sourceMappingURL=describe.d.ts.map