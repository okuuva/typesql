import { Result } from 'neverthrow';
import type { DatabaseClient, TypeSqlError } from '../types';
export declare function createLibSqlClient(url: string, attachList: string[], loadExtensions: string[], authToken: string): Result<DatabaseClient, TypeSqlError>;
//# sourceMappingURL=libsql.d.ts.map