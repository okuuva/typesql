import { type Either } from 'fp-ts/lib/Either';
import type { SchemaDef, TypeSqlError } from '../types';
import { type ColumnSchema } from '../mysql-query-analyzer/types';
import type { TraverseResult2 } from '../mysql-query-analyzer/traverse';
type ParseAndTraverseResult = {
    traverseResult: TraverseResult2;
    namedParameters: string[];
    nested: boolean;
    dynamicQuery: boolean;
    processedSql: string;
};
export declare function traverseSql(sql: string, dbSchema: ColumnSchema[]): Either<TypeSqlError, ParseAndTraverseResult>;
export declare function parseSql(sql: string, dbSchema: ColumnSchema[]): Either<TypeSqlError, SchemaDef>;
export {};
//# sourceMappingURL=parser.d.ts.map