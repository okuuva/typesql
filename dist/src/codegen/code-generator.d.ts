import { PostgresSchemaInfo, SchemaInfo } from '../schema-info';
import { DatabaseClient, TypeSqlError } from '../types';
import { Either } from 'fp-ts/lib/Either';
export declare function generateTsFile(client: DatabaseClient, sqlFile: string, tsFilePath: string, schemaInfo: SchemaInfo | PostgresSchemaInfo, isCrudFile: boolean): Promise<void>;
export declare function generateTypeScriptContent(params: {
    client: DatabaseClient;
    queryName: string;
    sqlContent: string;
    schemaInfo: SchemaInfo | PostgresSchemaInfo;
    isCrudFile: boolean;
}): Promise<Either<TypeSqlError, string>>;
export declare function writeFile(filePath: string, tsContent: string): void;
//# sourceMappingURL=code-generator.d.ts.map