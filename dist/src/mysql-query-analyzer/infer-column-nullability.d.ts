import { QuerySpecificationContext, type ExprContext } from '@wsporto/typesql-parser/mysql/MySQLParser';
import type { ColumnSchema, FieldName, ColumnDef } from './types';
export declare function parseAndInferNotNull(sql: string, dbSchema: ColumnSchema[]): (boolean | undefined)[];
export declare function inferNotNull(querySpec: QuerySpecificationContext, dbSchema: ColumnSchema[], fromColumns: ColumnDef[]): boolean[];
export declare function possibleNull(field: FieldName, exprContext: ExprContext): boolean;
//# sourceMappingURL=infer-column-nullability.d.ts.map