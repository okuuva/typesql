import { PostgresTraverseResult } from './traverse';
import { PostgresColumnSchema } from '../drivers/types';
import { Result } from 'neverthrow';
import { CheckConstraintResult } from '../drivers/postgres';
import { UserFunctionSchema } from './types';
export declare function parseSql(sql: string, dbSchema: PostgresColumnSchema[], checkConstraints: CheckConstraintResult, userFunctions: UserFunctionSchema[], options?: import("./traverse").TraverseOptions): PostgresTraverseResult;
export declare function safeParseSql(sql: string, dbSchema: PostgresColumnSchema[], checkConstraints: CheckConstraintResult, userFunctions: UserFunctionSchema[], options?: import("./traverse").TraverseOptions): Result<PostgresTraverseResult, string>;
//# sourceMappingURL=parser.d.ts.map