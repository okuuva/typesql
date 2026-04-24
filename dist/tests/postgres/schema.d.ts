import { CheckConstraintResult, EnumMap } from '../../src/drivers/postgres';
import { PostgresColumnSchema } from '../../src/drivers/types';
import { UserFunctionSchema } from '../../src/postgres-query-analyzer/types';
import { PostgresSchemaInfo } from '../../src/schema-info';
import postgres from 'postgres';
export declare const schema: PostgresColumnSchema[];
export declare const userDefinedFunctions: UserFunctionSchema[];
export declare const enumMap: EnumMap;
export declare const checkConstraints: CheckConstraintResult;
export declare const userFunctions: UserFunctionSchema[];
export declare function createSchemaInfo(): PostgresSchemaInfo;
export declare function createTestClient(): postgres.Sql<{}>;
export declare function normalizeUserFunctions(userFunctions: UserFunctionSchema[]): {
    definition: string;
    schema: string;
    function_name: string;
    arguments: string;
    return_type: string;
    language: string;
}[];
//# sourceMappingURL=schema.d.ts.map